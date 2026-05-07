import { CategoryRepository } from "../../../repositories/ProductRepository.ts";

export async function ProductsCallback(context: any) {
  const categories = await CategoryRepository.findAll();
}
