import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@src/database/Database.service';
import { IReturnMessage } from '@src/model/ReturnMessage.model';
import { IDatabaseReturnModel } from '@src/model/DatabaseReturn.model';
import { mountSqlUpdateKeysAndValues } from '@src/utils/MountSqlUpdateKeysAndValues.utils';
import {
  CreateEmployeeDto,
  DeleteEmployeeDto,
  UpdateEmployeeDto,
} from '@src/dto/Employee.dto';
import { IEmployee } from '@src/model/Employee.model';

@Injectable()
export class EmployeeRepository {
  constructor(private readonly db: DatabaseService) {}
  async create(data: CreateEmployeeDto): Promise<IReturnMessage> {
    const query =
      'INSERT INTO public.employee (name, company_id, picture, cpf, password, email, telephone, status_id, type_id) values ($1, $2, $3, $4, $5, $6, $7, 1, $8)';
    const values = [
      data.name.toUpperCase(),
      data.company_id,
      data.picture,
      data.cpf,
      data.password,
      data.email,
      data.telephone,
      parseInt(String(data.type_id)),
    ];

    await this.db.query(query, values);

    return { message: 'Funcionário criado com sucesso' };
  }

  async findAllEmployees(): Promise<IEmployee[] | object[]> {
    const query =
      'SELECT e.id, e.name AS employee_name, e.picture, c.name AS company_name, e.cpf, e.email, t.name AS type_account, s.name AS status_account FROM public.employee AS e JOIN public.company AS c ON c.id = e.company_id LEFT JOIN public.type_account AS t ON t.id = e.type_id LEFT JOIN public.status_account AS s ON s.id = e.status_id WHERE c.id = e.company_id;';
    const result: IDatabaseReturnModel = await this.db.query(query);

    return result.rows;
  }

  async findAllEmployeesWithIdCompany(
    id: number,
  ): Promise<IEmployee[] | object[]> {
    const query =
      'SELECT e.id, e.name AS employee_name, e.picture, c.name AS company_name, e.cpf, e.email, t.name AS type_account, s.name AS status_account FROM public.employee AS e JOIN public.company AS c ON c.id = e.company_id LEFT JOIN public.type_account AS t ON t.id = e.type_id LEFT JOIN public.status_account AS s ON s.id = e.status_id WHERE c.id = ($1);';
    const param = [id];
    const result: IDatabaseReturnModel = await this.db.query(query, param);

    return result.rows;
  }

  async findOneEmployee(id: number): Promise<IEmployee | object> {
    const query =
      'SELECT e.id, e.name AS employee_name, e.picture, c.name AS company_name, e.cpf, e.email, t.name AS type_account, s.name AS status_account FROM public.employee AS e JOIN public.company AS c ON c.id = e.company_id LEFT JOIN public.type_account AS t ON t.id = e.type_id LEFT JOIN public.status_account AS s ON s.id = e.status_id WHERE e.id = ($1);';
    const param = [id];
    const result: IDatabaseReturnModel = await this.db.query(query, param);

    return result.rows[0];
  }

  async updateOneEmployee(
    id: number,
    data: UpdateEmployeeDto,
  ): Promise<IReturnMessage> {
    const { setQuery, queryParams } = await mountSqlUpdateKeysAndValues(
      id,
      data,
    );
    const query = `UPDATE public.company SET ${setQuery} WHERE id = ($1)`;
    await this.db.query(query, queryParams);

    return { message: 'Funcionário atualizado com sucesso' };
  }

  async deleteOneEmployee(dto: DeleteEmployeeDto): Promise<IReturnMessage> {
    const query = 'UPDATE public.employee SET status_id = 4 WHERE id = ($1)';
    const param = [dto.id];
    await this.db.query(query, param);

    return { message: 'Funcionário excluído com sucesso' };
  }

  async getCode(id: number): Promise<IReturnMessage | object> {
    const query = `DELETE FROM public.employee WHERE e.id = ($1)`;
    const param = [id];
    const result: IDatabaseReturnModel = await this.db.query(query, param);

    return result.rows[0];
  }

  async validateUser(email: string): Promise<object> {
    const query = `SELECT id, email, password, type_id, status_id FROM public.employee WHERE email = ($1)`;
    const param = [email];
    const result: IDatabaseReturnModel = await this.db.query(query, param);

    return result.rows[0];
  }
}
