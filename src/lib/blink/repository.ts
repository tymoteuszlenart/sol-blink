import { BlinkTemplate } from "./types";

export interface TemplateRepository {
  getBySlug(slug: string): Promise<BlinkTemplate | null>;
  listActive(): Promise<BlinkTemplate[]>;
}

export class InMemoryTemplateRepository implements TemplateRepository {
  constructor(private readonly templates: BlinkTemplate[]) {}

  async getBySlug(slug: string): Promise<BlinkTemplate | null> {
    const template = this.templates.find((item) => item.slug === slug && item.isActive);
    return template ?? null;
  }

  async listActive(): Promise<BlinkTemplate[]> {
    return this.templates.filter((item) => item.isActive);
  }
}

// Database adapter target:
// Implement TemplateRepository with Prisma/Postgres without changing route code.
