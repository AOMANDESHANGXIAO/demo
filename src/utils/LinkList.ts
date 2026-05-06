class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class LinkedList<T> {
  public head: ListNode<T> | null = null;
  public tail: ListNode<T> | null = null;
  public _size: number = 0;

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  append(value: T): void {
    const node = new ListNode(value);
    if (this.isEmpty) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail!.next = node;
      this.tail = node;
    }
    this._size++;
  }

  prepend(value: T): void {
    const node = new ListNode(value);
    if (this.isEmpty) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head = node;
    }
    this._size++;
  }

  delete(value: T): boolean {
    if (this.isEmpty) return false;

    if (this.head!.value === value) {
      this.head = this.head!.next;
      if (this.head === null) this.tail = null;
      this._size--;
      return true;
    }

    let current = this.head;
    while (current!.next) {
      if (current!.next.value === value) {
        if (current!.next === this.tail) {
          this.tail = current;
        }
        current!.next = current!.next.next;
        this._size--;
        return true;
      }
      current = current!.next;
    }
    return false;
  }

  find(value: T): ListNode<T> | null {
    let current = this.head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return null;
  }

  contains(value: T): boolean {
    return this.find(value) !== null;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }
}