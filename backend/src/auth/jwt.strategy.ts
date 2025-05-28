import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET não está definido nas variáveis de ambiente');
        }

        console.log('Debug - Inicializando JwtStrategy:', {
            hasSecret: !!secret,
            secretLength: secret.length,
            secretFirstChars: secret.substring(0, 5) + '...',
            extractorType: 'fromAuthHeaderAsBearerToken'
        });
        
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        console.log('Debug - Validando payload JWT:', {
            sub: payload.sub,
            email: payload.email,
            exp: payload.exp,
            currentTime: Math.floor(Date.now() / 1000),
            payloadCompleto: JSON.stringify(payload)
        });

        try {
            const user = await this.authService.validateUser(payload.sub);
            if (!user) {
                console.log('Debug - Usuário não encontrado:', payload.sub);
                throw new UnauthorizedException('Usuário não encontrado');
            }
            
            console.log('Debug - Usuário validado com sucesso:', {
                id: user._id,
                email: user.email_usuario,
                nome: user.nome_usuario
            });
            
            return {
                sub: payload.sub,
                email: user.email_usuario,
                isAdmin: user.eAdmin,
                nome: user.nome_usuario
            };
        } catch (error) {
            console.error('Debug - Erro na validação:', {
                error: error.message,
                stack: error.stack,
                payload: JSON.stringify(payload)
            });
            throw new UnauthorizedException('Token inválido');
        }
    }
} 