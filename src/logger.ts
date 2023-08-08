import {createLogger} from '@pexip/logger';
import {setLogger as setPluginApiLogger} from '@pexip/plugin-api';

const rootLogger = createLogger();
export const logger = rootLogger.child({name: 'modal-plugin'});
setPluginApiLogger(logger);
