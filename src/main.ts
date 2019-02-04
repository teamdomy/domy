import { UserCommand } from "./commands/user.command";
import { DomyCommands } from "./commands/domy.command";

const domyCommands = new DomyCommands();
const userCommand = new UserCommand();

domyCommands.start();
userCommand.start();
