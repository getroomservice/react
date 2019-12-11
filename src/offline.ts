/**
 * A wrapper around idb-keyval to make the
 * "set" and "get" functions more explicit and
 * readable.
 */

import { get, set } from "idb-keyval";

const Offline = {
  get,
  set
};

export default Offline;
