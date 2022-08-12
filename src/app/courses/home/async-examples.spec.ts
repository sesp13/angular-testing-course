import { fakeAsync, flush, flushMicrotasks, tick } from "@angular/core/testing";

fdescribe("Async Testing Examples", () => {
  it("Asyncronous test example with Jasmine done()", (done: DoneFn) => {
    let test = false;
    setTimeout(() => {
      test = true;
      expect(test).toBeTruthy();
      done();
    }, 1000);
  });

  it("Asycncronous test example - setTimeout()", fakeAsync(() => {
    let test = false;
    setTimeout(() => {
      test = true;
    }, 1000);

    // Move the clock 1000 ms
    // tick(1000);

    // Execute all the pending async tasks
    flush();

    expect(test).toBeTruthy();
  }));

  it("Asycncronous test example - plain Promise", fakeAsync(() => {
    let test = false;

    Promise.resolve().then(() => {
      test = true;
    });

    // A promise is a microtask, for this reason this works
    flushMicrotasks();

    expect(test).toBeTruthy();
  }));

  it("Async test example - Promises + setTimeOut()", fakeAsync(() => {
    let counter = 0;

    Promise.resolve().then(() => {
      counter += 10;
      setTimeout(() => {
        counter += 1;
      }, 1000);
    });

    expect(counter).toBe(0);
    // Run only the promise
    flushMicrotasks();
    expect(counter).toBe(10);
    // Run the setTimeOut()
    flush();
    expect(counter).toBe(11);
  }));
});
