import { UserCommand } from "./commands/user.command";
import { DomyCommands } from "./commands/domy.command";

const dm = new DomyCommands();
const us = new UserCommand();

dm.start();
us.start();
