import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { WorkspaceRole, BoardRole } from '@prisma/client';
import { MailService } from '../common/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto, userAgent?: string, ipAddress?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user and a default starter Workspace & Board
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        name: dto.name.trim(),
        passwordHash,
        isEmailVerified: true,
      },
    });

    // Create default workspace
    const workspaceSlug = `${dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-workspace-${Date.now().toString().slice(-4)}`;
    const workspace = await this.prisma.workspace.create({
      data: {
        name: `${dto.name}'s Workspace`,
        slug: workspaceSlug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: WorkspaceRole.OWNER,
          },
        },
      },
    });

    // Create default starter Board
    const board = await this.prisma.board.create({
      data: {
        workspaceId: workspace.id,
        ownerId: user.id,
        title: '🚀 Getting Started',
        description: 'Welcome to your new workspace! Drag and drop cards to get organized.',
        backgroundType: 'gradient',
        backgroundValue: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
        members: {
          create: {
            userId: user.id,
            role: BoardRole.ADMIN,
          },
        },
        lists: {
          create: [
            {
              title: 'To Do',
              position: 1000,
              cards: {
                create: [
                  {
                    title: '👋 Welcome to your new Trello Clone!',
                    description: 'Click on any card to edit details, add checklists, set due dates, and add comments.',
                    position: 1000,
                    coverColor: '#3b82f6',
                  },
                ],
              },
            },
            {
              title: 'In Progress',
              position: 2000,
              cards: {
                create: [
                  {
                    title: 'Try dragging me to another list!',
                    description: 'Experience fluid drag-and-drop powered by Framer Motion and WebSockets.',
                    position: 1000,
                    coverColor: '#10b981',
                  },
                ],
              },
            },
            {
              title: 'Done',
              position: 3000,
            },
          ],
        },
      },
    });

    this.mailService.sendWelcomeEmail(user.email, user.name).catch(() => {});

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken, userAgent, ipAddress);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
      defaultBoardId: board.id,
    };
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken, userAgent, ipAddress);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string, userAgent?: string, ipAddress?: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'super-secret-jwt-refresh-key-production-ready-2026',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Session expired');
      }

      // Invalidate old refresh tokens for this device session if desired or rotate
      const tokens = await this.generateTokens(user.id, user.email);
      await this.saveRefreshToken(user.id, tokens.refreshToken, userAgent, ipAddress);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = await bcrypt.hash(refreshToken, 6);
      // Clean up token records
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      // Return success message to prevent user enumeration
      return { message: 'If an account with this email exists, a 6-digit reset code has been sent.' };
    }

    // Generate 6-digit numeric reset code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExp = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    // Send email with reset code
    const mailResult = await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    if (!mailResult.success && mailResult.error) {
      if (mailResult.error.includes('testing emails')) {
        return {
          message: `Resend Sandbox Mode: Verification code is ${resetToken} (Resend sandbox requires custom domain to email unverified addresses).`,
          devCode: resetToken,
        };
      }
      return {
        message: `Notice: Email delivery encountered an issue (${mailResult.error}). Reset code: ${resetToken}`,
        devCode: resetToken,
      };
    }

    return { message: 'A 6-digit verification code has been dispatched to your email address.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExp: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    // Revoke all existing refresh tokens on password change
    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    return { message: 'Password has been successfully updated. You can now log in.' };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'super-secret-jwt-access-key-production-ready-2026',
      expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'super-secret-jwt-refresh-key-production-ready-2026',
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d') as any,
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(
    userId: string,
    token: string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const tokenHash = await bcrypt.hash(token, 8);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });
  }
}
