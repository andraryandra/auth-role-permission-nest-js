import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImagesEntity } from './product-images.entity';
import { CategoryEntity } from 'src/modules/categories/entities/category.entity';
import { BaseEntity } from 'src/config/common/BaseEntity';

@Entity('products')
export class ProductEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', unique: true })
  name: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'stock', type: 'int' })
  stock: number;

  @Column({ name: 'status', type: 'boolean', default: false })
  status: boolean;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({
    name: 'category_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_category_id',
  })
  category: CategoryEntity;

  @OneToMany(() => ProductImagesEntity, (image) => image.product)
  productImages: ProductImagesEntity[];
}
