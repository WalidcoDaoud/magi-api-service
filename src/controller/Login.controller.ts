import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '@src/middleware/Auth.service';
import { ValidateLoginDto } from '@src/dto/Login.dto';
import { IReturnMessage } from '@src/model/ReturnMessage.model';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ILoginPayload } from '@src/model/Login.model';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('v1/login')
@ApiTags('Login')
export class LoginController {
  constructor(private readonly loginService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Validate user login credentials' })
  @ApiResponse({ status: 200, description: 'Login validation successful.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Invalid credentials.',
  })
  @ApiBody({ type: ValidateLoginDto })
  async validateLogin(@Body() body: ValidateLoginDto): Promise<IReturnMessage> {
    return await this.loginService.validateUser(body);
  }

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get login information for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User login information retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Token missing or invalid.',
  })
  async getLoginInformation(@Req() req: Request) {
    const payload: ILoginPayload | any = req.user;
    return {
      role: payload.role,
      type: payload.type,
      id: payload.id,
    };
  }
}
