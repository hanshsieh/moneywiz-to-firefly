function* gen() {
  while(true) {
    try {
       yield 42;
    } catch(e) {
      console.log('Error caught!');
      throw e;
    }
  }
}

const g = gen();
console.info(g.next());
console.info(g.throw(new Error('Something went wrong')));
