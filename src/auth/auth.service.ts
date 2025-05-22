import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
    ) { }

    async generateToken(userId: string) {
        const payload = { sub: userId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async validateUser(userId: string) {
        return this.usuariosService.findOne(userId);
    }
} 