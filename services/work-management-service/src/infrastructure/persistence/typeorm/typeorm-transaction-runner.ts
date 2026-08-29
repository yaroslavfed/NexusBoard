import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { TransactionRunner } from '../../../tasks/application/ports/transaction-runner';
@Injectable()
export class TypeOrmTransactionRunner implements TransactionRunner {
  constructor(private readonly dataSource: DataSource) {}
  run<T>(operation: () => Promise<T>): Promise<T> {
    return this.dataSource.transaction(operation);
  }
}
