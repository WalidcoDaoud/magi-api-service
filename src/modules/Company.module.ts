import { Module } from '@nestjs/common';
import { DatabaseService } from '@src/database/Database.service';
import { CompanyController } from '@src/controller/Company.controller';
import { CompanyService } from '@src/service/Company.service';
import { CompanyRepository } from '@src/repository/Company.repository';
import { RandomCode } from '@src/utils/RandomCode.utils';
import { Cryptography } from '@src/utils/Cryptograph.utils';
import { Email } from '@src/utils/Email.utils';
import { AddressRepository } from '@src/repository/Address.repository';
import { TypeAccountRepository } from '@src/repository/TypeAccount.repository';

@Module({
  imports: [],
  controllers: [CompanyController],
  providers: [
    CompanyService,
    CompanyRepository,
    AddressRepository,
    TypeAccountRepository,
    DatabaseService,
    RandomCode,
    Cryptography,
    Email,
  ],
})
export class CompanyModule {}
