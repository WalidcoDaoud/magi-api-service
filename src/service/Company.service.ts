import { Injectable } from '@nestjs/common';
import { ZodError } from 'zod';
import { ValidationException } from '@src/exceptions/Validation.exception';
import { IReturnMessage } from '@src/model/ReturnMessage.model';
import { CompanyRepository } from '@src/repository/Company.repository';
import { AddressRepository } from '@src/repository/Address.repository';
import {
  CreateCompanyDto,
  DeleteCompanyDto,
  UpdateCompanyDto,
  ValidateCodeDto,
} from '@src/dto/Company.dto';
import { ICompany } from '@src/model/Company.model';
import { RandomCode } from '@src/utils/RandomCode.utils';
import { Cryptography } from '@src/utils/Cryptograph.utils';
import { Email } from '@src/utils/Email.utils';
import axios from 'axios';
import { TypeAccountRepository } from '@src/repository/TypeAccount.repository';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly addressRepository: AddressRepository,
    private readonly typeAccountRepository: TypeAccountRepository,
    private readonly codeGenerator: RandomCode,
    private readonly cryptography: Cryptography,
    private readonly email: Email,
  ) {}

  async createCompany(data: CreateCompanyDto): Promise<IReturnMessage> {
    try {
      const codeGenerated = this.codeGenerator.generateRandomPassword();

      data['password'] = await this.cryptography.hashPassword(codeGenerated);

      const newCompany = new CreateCompanyDto(data);

      newCompany['address_id'] = await this.addressRepository.create({
        cep: data.cep,
        street: data.street,
        city: data.city,
        state: data.state,
        number: data.number,
      });

      const idTypeAccount = await this.typeAccountRepository.findOneByName(
        data.type_account,
      );

      newCompany['type_account'] = String(idTypeAccount.id);

      await this.companyRepository.create(newCompany);

      await this.email.sendEmailWithCode(
        data.email,
        'Defina Sua Primeira Senha!',
        data.name,
        codeGenerated,
      );

      return { message: 'Empresa criada com sucesso' };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationException(error);
      } else if (error instanceof ValidationException) {
        return { message: error.message };
      }

      throw error;
    }
  }

  async findAllCompanies(): Promise<ICompany[] | object[]> {
    try {
      return await this.companyRepository.findAll();
    } catch (error) {
      throw error;
    }
  }

  async findOneCompany(id: number): Promise<ICompany | object> {
    try {
      return await this.companyRepository.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async updateOneCompany(
    id: number,
    data: UpdateCompanyDto,
  ): Promise<IReturnMessage> {
    try {
      const updateCompany = new UpdateCompanyDto(data);
      return await this.companyRepository.updateOne(id, updateCompany);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationException(error);
      } else if (error instanceof ValidationException) {
        return { message: error.message };
      }

      throw error;
    }
  }

  async deleteOneCompany(id: number): Promise<IReturnMessage> {
    try {
      const deleteCompany = new DeleteCompanyDto(id);
      return await this.companyRepository.deleteOne(deleteCompany);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationException(error);
      } else if (error instanceof ValidationException) {
        return { message: error.message };
      }

      throw error;
    }
  }

  async validateCode(
    id: number,
    data: ValidateCodeDto,
  ): Promise<boolean | IReturnMessage> {
    try {
      const password: object = await this.companyRepository.getCode(id);
      return await this.cryptography.comparePassword(
        data.code.toString(),
        password['password'],
      );
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationException(error);
      } else if (error instanceof ValidationException) {
        return { message: error.message };
      }

      throw error;
    }
  }

  async uploadImage(id: number, file: Express.Multer.File) {
    try {
      const formData = new FormData();
      const imageBase64 = file.buffer.toString('base64');

      formData.append('key', process.env.IMAGE_BB_KEY);
      formData.append('image', imageBase64);

      const imageUrl = await axios.post(
        'https://api.imgbb.com/1/upload',
        formData,
      );

      await this.companyRepository.updateOne(id, {
        picture: imageUrl.data['data']['image']['url'],
      });

      return { message: 'Imagem alterada com sucesso' };
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
