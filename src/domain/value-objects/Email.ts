export class Email {
  public readonly value: string;
  constructor(value: string) {
    if (!value) {
      throw new Error('Email is required');
    }
    if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email address');
    }
    this.value = value;
  }
}
