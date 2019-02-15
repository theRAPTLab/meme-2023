/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ PMC Properties
/*/

class CProp {
  // ts class property declaration
  prid: number;

  // a unique integer id
  label: string;

  // a unique string
  children: number[];

  // array of CProp ids
  // ts static class declarations
  static DBG: boolean = true;

  static MAX_ID: number = 0;

  // constructor
  constructor(cprop: any) {
    if (cprop) {
      if (CProp.DBG) console.log('wrapping object');
      this.prid = cprop.id;
      this.label = cprop.label;
      if (Array.isArray(cprop.children)) {
        this.children = cprop.children.slice();
      }
    } else {
      if (CProp.DBG) console.log('new object');
      this.prid = CProp.MAX_ID++;
      this.label = `NEW${this.prid}`;
      this.children = [];
    }
  }
  //
}

class CMech {
  // ts class property declaration
  meid: number;

  // a unique integer id
  label: string;

  // a unique string
  // ts static class declarations
  static DBG: boolean = true;

  static MAX_ID: number = 0;

  // constructor
  constructor(cprop: any) {
    if (cprop) {
      if (CProp.DBG) console.log('wrapping object');
      this.meid = cprop.id;
      this.label = cprop.label;
    } else {
      this.meid = CProp.MAX_ID++;
      this.label = `NEW${this.meid}`;
    }
  }
}

export { CProp, CMech };
