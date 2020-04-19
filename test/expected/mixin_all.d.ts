declare module "mixins" {
    interface MyMixin1 {
    }
    interface MyMixin2 {
    }
    interface MyInterface {
    }
    class MyBaseClass {
    }
    interface MyMixedClass extends MyInterface, MyMixin1, MyMixin2 {
    }
    class MyMixedClass extends MyBaseClass implements MyInterface, MyMixin1, MyMixin2 {
    }
}
