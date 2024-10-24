import { Module } from '@nestjs/common';
import { DatabaseService } from '@src/database/Database.service';
import { RandomCode } from '@src/utils/RandomCode.utils';
import { Cryptography } from '@src/utils/Cryptograph.utils';
import { Email } from '@src/utils/Email.utils';
import { EmployeeController } from '@src/controller/Employee.controller';
import { EmployeeRepository } from '@src/repository/Employee.repository';
import { EmployeeService } from '@src/service/Employee.service';
import { TypeAccountRepository } from '@src/repository/TypeAccount.repository';

@Module({
  imports: [],
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    EmployeeRepository,
    TypeAccountRepository,
    DatabaseService,
    RandomCode,
    Cryptography,
    Email,
  ],
})
export class EmployeeModule {}
