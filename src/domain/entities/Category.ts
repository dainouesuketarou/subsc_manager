export type CategoryId = string;
export type CategoryName = string;

export class Category {
  private readonly id: CategoryId;
  private readonly name: CategoryName;

  constructor(id: CategoryId, name: CategoryName) {
    this.id = id;
    this.name = name;
  }
}
