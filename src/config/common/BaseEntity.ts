import {
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  VersionColumn,
} from 'typeorm';
import * as moment from 'moment';

export abstract class BaseEntity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_inactive', type: 'boolean', default: false })
  isInactive: boolean;

  @VersionColumn({ name: 'version', nullable: false, default: 1 })
  version: number;

  @BeforeInsert()
  updateDates() {
    const now = moment().add(7, 'hours').toDate();
    this.createdAt = now;
    this.updatedAt = now;
    this.version = 0;
  }

  @BeforeUpdate()
  updateUpdatedAt() {
    this.updatedAt = moment().add(7, 'hours').toDate();
    if (!this.isActive) {
      this.isInactive = true;
    }
  }
}
