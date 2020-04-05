declare interface MyMixin1 {
}

declare interface MyMixin2 {
}

declare interface MyInterface {
}

declare class MyBaseClass {
}

declare interface MyMixedClass extends MyInterface, MyMixin1, MyMixin2 {
}

declare class MyMixedClass extends MyBaseClass implements MyInterface, MyMixin1, MyMixin2 {
}
