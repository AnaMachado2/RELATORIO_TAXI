import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configura e inicializa a documentação do Swagger para a aplicação.
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('API de Relatórios de Táxi')
    .setDescription(
      'APIs funcionais para consulta e geração de relatórios em formato PDF para motoristas de táxi e permissionários, integrando os bancos de dados ATENA (SIT) e PRD_SEMOB.'
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
