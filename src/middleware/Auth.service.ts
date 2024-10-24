import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ValidateLoginDto } from '@src/dto/Login.dto';
import { ZodError } from 'zod';
import { ValidationException } from '@src/exceptions/Validation.exception';
import { ILogin, ILoginPayload } from '@src/model/Login.model';
import { CompanyRepository } from '@src/repository/Company.repository';
import { EmployeeRepository } from '@src/repository/Employee.repository';
import { IReturnMessage } from '@src/model/ReturnMessage.model';
import { Cryptography } from '@src/utils/Cryptograph.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly companyRepository: CompanyRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly cryptograph: Cryptography,
  ) {}

  public generateToken(email: string, role: boolean, type: number): string {
    const payload = { email, role, type };
    return this.jwtService.sign(payload);
  }

  private async findUser(data: ILogin): Promise<object> {
    if (data.type) {
      return await this.companyRepository.validateUser(data.email);
    } else if (!data.type) {
      return await this.employeeRepository.validateUser(data.email);
    }
  }

  public async validateToken(payload: ILoginPayload) {
    return { email: payload.email, role: payload.role, type: payload.type };
  }

  public async validateUser(data: ValidateLoginDto): Promise<IReturnMessage> {
    try {
      const accountData = new ValidateLoginDto(data);
      const validation: ILogin | undefined = await this.findUser(accountData);
      console.log(validation);
      if (
        validation &&
        validation.status_id === 1 &&
        (await this.cryptograph.comparePassword(
          data.password,
          validation.password,
        ))
      ) {
        return {
          status: true,
          message: {
            token: this.generateToken(
              validation.email,
              data.type,
              validation.type_id,
            ),
          },
        };
      } else {
        return {
          status: false,
          message:
            'Não foi possível realizar o login. Verifique se o tipo de conta, o nome de usuário ou a senha estão corretos e tente novamente.',
        };
      }
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationException(error);
      } else if (error instanceof ValidationException) {
        return { message: error.message };
      }

      throw error;
    }
  }
}
