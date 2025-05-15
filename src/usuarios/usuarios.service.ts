import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  UnauthorizedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<{ message: string }> {
    const usuarioExistente = await this.usuarioModel.findOne({
      $or: [
        { email_usuario: createUsuarioDto.email_usuario },
        { cpf_usuario: createUsuarioDto.cpf_usuario }
      ]
    });

    if (usuarioExistente) {
      throw new ConflictException('Usuário já cadastrado com este email ou CPF');
    }

    const usuario = new this.usuarioModel({
      ...createUsuarioDto,
      eAdmin: false,
      ePremium: false
    });

    await usuario.save();
    return { message: 'Usuário criado com sucesso' };
  }

  async login(loginUsuarioDto: LoginUsuarioDto) {
    const usuario = await this.usuarioModel.findOne({
      email_usuario: loginUsuarioDto.email_usuario
    });

    if (!usuario || !(await bcrypt.compare(loginUsuarioDto.senha_usuario, usuario.senha_usuario))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {
      usuario: {
        id: usuario._id,
        nome_usuario: usuario.nome_usuario,
        email_usuario: usuario.email_usuario,
        eAdmin: usuario.eAdmin
      }
    };
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }
} 