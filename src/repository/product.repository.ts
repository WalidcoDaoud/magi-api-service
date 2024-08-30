import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { IReturnMessage } from '../model/returnMessage.model';
import { IDatabaseReturnModel } from '../model/databaseReturn.model';
import { mountSqlUpdateKeysAndValues } from '../utils/mountSqlUpdateKeysAndValues.utils';
import { CreateProductDto, DeleteProductDto, UpdateProductDto } from 'src/dto/Product.dto';
import { IProduct } from 'src/model/Product.model';

@Injectable()
export class ProductRepository {
  constructor(private readonly db: DatabaseService) {}
  async create(data: CreateProductDto): Promise<IReturnMessage> {
    const query =
      'INSERT INTO public.Product (name, type, value, lenght, width, height, company_id) values ($1, $2, $3, $4, $5, $6, $7)';
    const values = [
      data.name.toUpperCase(),
      data.type,
      data.value,
      data.lenght,
      data.width, 
      data.height,
      data.company_id
    ];

    await this.db.query(query, values);

    return { message: 'Produto criado com sucesso' };
  }

  async findAllProducts(): Promise<IProduct[] | object[]> {
    const query =
      'SELECT p.id, p.name AS Product_name, p.lenght, p.width, p.height AS Product_informations FROM public.Product AS p JOIN public.company AS c ON c.id = e.company_id LEFT JOIN public.type_account AS t ON t.id = e.type_id LEFT JOIN public.status_account AS s ON s.id = e.status_id WHERE c.id = e.company_id;';
    const result: IDatabaseReturnModel = await this.db.query(query);

    return result.rows;
  }

  async findOneProduct(id: number): Promise<IProduct | object> {
    const query =
      "SELECT e.id, e.name AS Product_name, e.picture, c.name AS company_name, e.cpf, e.email, t.name AS type_account, s.name AS status_account FROM public.Product AS e JOIN public.company AS c ON c.id = e.company_id LEFT JOIN public.type_account AS t ON t.id = e.type_id LEFT JOIN public.status_account AS s ON s.id = e.status_id WHERE c.id = ($1);"
    const param = [id];
    const result: IDatabaseReturnModel = await this.db.query(query, param);

    return result.rows[0];
  }

  async updateOneProduct(id: number, data: UpdateProductDto): Promise<IReturnMessage> {
    const { setQuery, queryParams } = await mountSqlUpdateKeysAndValues(
      id,
      data,
    );
    const query = `UPDATE public.company SET ${setQuery} WHERE id = ($1)`;
    await this.db.query(query, queryParams);

    return { message: 'Funcionário atualizado com sucesso' };
  }

  async deleteOneProduct(dto: DeleteProductDto): Promise<IReturnMessage> {
    const query = 'DELETE FROM public.Product AS e WHERE e.id = ($1)';
    const param = [dto.id];  // Extract the ID from the DTO
    await this.db.query(query, param);

    return { message: 'Funcionário excluído com sucesso' };
}


  async getCode(id: number): Promise<IReturnMessage | object> {
    const query = `DELETE FROM public.Product WHERE e.id = ($1)`;
    const param = [id];
    const result: IDatabaseReturnModel = await this.db.query(query, param);

    return result.rows[0];
  }
}
