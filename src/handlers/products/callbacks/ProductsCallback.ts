import { CategoryRepository } from "../../../repositories/ProductRepository.ts";

export async function ProductsCallback(context: any) {
  const categories = await CategoryRepository.findAll();
  console.log("[CATEGORIES] : ", categories);
}
