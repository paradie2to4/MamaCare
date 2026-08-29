import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

const REFRESH_COOKIE_NAME = 'mamacare_refresh_token';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setRefreshCookie(res: Response, token: string, expiresAt: Date) {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: this.configService.get<string>('COOKIE_SECURE') === 'true',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/api/v1/auth',
    });
  }

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { auth, refreshToken, refreshExpiresAt } = await this.authService.register(dto);
    this.setRefreshCookie(res, refreshToken, refreshExpiresAt);
    return auth;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { auth, refreshToken, refreshExpiresAt } = await this.authService.login(dto);
    this.setRefreshCookie(res, refreshToken, refreshExpiresAt);
    return auth;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const presented = req.cookies?.[REFRESH_COOKIE_NAME];
    const { auth, refreshToken, refreshExpiresAt } = await this.authService.refresh(presented);
    this.setRefreshCookie(res, refreshToken, refreshExpiresAt);
    return auth;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const presented = req.cookies?.[REFRESH_COOKIE_NAME];
    await this.authService.logout(presented);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
  }

  @Get('me')
  async me(@CurrentUser() user: JwtPayload): Promise<AuthResponseDto['user']> {
    return this.authService.me(user.sub);
  }
}
