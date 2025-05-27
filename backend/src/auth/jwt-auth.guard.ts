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
            const request = context.switchToHttp().getRequest();
            const token = this.extractTokenFromHeader(request);

            if (!token) {
                throw new UnauthorizedException('Token não encontrado');
            }

            try {
                const payload = this.jwtService.verify(token);
                
                // Verifica se o token expirou
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp && payload.exp < now) {
                    throw new UnauthorizedException('Token expirado');
                }

                // Adiciona o payload decodificado à requisição
                request.user = payload;

                // Chama o método canActivate do AuthGuard para validação adicional
                const canActivate = await super.canActivate(context);
                if (!canActivate) {
                    throw new UnauthorizedException('Token inválido');
                }

                return true;
            } catch (error) {
                console.error('Erro na validação do token:', error);
                throw new UnauthorizedException('Token inválido');
            }
        } catch (error) {
            console.error('Erro no guard:', error);
            throw new UnauthorizedException(error.message);
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
} 