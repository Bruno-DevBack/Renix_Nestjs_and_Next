import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private jwtService: JwtService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            // Primeiro tenta a autenticação padrão do passport-jwt
            const canActivate = await super.canActivate(context);
            if (!canActivate) {
                return false;
            }

            const request = context.switchToHttp().getRequest();
            const token = this.extractTokenFromHeader(request);

            if (!token) {
                throw new UnauthorizedException('Token não encontrado');
            }

            try {
                const payload = this.jwtService.verify(token);
                // Verifica se o token expirou
                const now = Date.now();
                if (payload.exp && payload.exp < now) {
                    throw new UnauthorizedException('Token expirado');
                }

                // Adiciona o payload decodificado à requisição
                request.user = payload;
                return true;
            } catch (error) {
                throw new UnauthorizedException('Token inválido');
            }
        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
} 