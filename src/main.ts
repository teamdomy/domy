import { DomCommand } from "./commands/dom.command";
import { UserCommand } from "./commands/user.command";

const dm = new DomCommand();
const uc = new UserCommand();

dm.start();
uc.start();
