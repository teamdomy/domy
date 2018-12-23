import { DomCommand } from "./commands/dom.command";
import { UserCommand } from "./commands/user.command";

const dm = new DomCommand();
const us = new UserCommand();

dm.start();
us.start();
