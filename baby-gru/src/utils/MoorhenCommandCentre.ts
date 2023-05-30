import { v4 as uuidv4 } from 'uuid';

type cootCommandKwargsType = { 
    message: string;
    data?: {};
    returnType?: any;
    command?: any;
 }

type WorkerMessageInterface = { 
    consoleMessage?: string;
    messageId: string;
    handler: (reply: WorkerResponseInterface) => void;
    kwargs: cootCommandKwargsType;
}

type WorkerResponseInterface = { 
    data: WorkerMessageInterface;
}

export interface MoorhenCommandCentreInterface {
    urlPrefix: string;
    cootWorker: any;
    consoleMessage: string;
    activeMessages: WorkerMessageInterface[];
    onCootInitialized: null | ( () => void );
    onConsoleChanged: null | ( (msg: string) => void );
    onNewCommand : null | ( (kwargs: any) => void );
    onActiveMessagesChanged: null | ( (activeMessages: WorkerMessageInterface[]) => void );
}

export class MoorhenCommandCentre implements MoorhenCommandCentreInterface {
    urlPrefix: string;
    cootWorker: any;
    consoleMessage: string;
    activeMessages: WorkerMessageInterface[];
    onCootInitialized: null | ( () => void );
    onConsoleChanged: null | ( (msg: string) => void );
    onNewCommand : null | ( (kwargs: any) => void );
    onActiveMessagesChanged: null | ( (activeMessages: WorkerMessageInterface[]) => void );

    constructor(props: { [x: string]: any; }) {
        this.consoleMessage = ""
        this.activeMessages = []
        this.onConsoleChanged = null
        this.onNewCommand = null
        this.onActiveMessagesChanged = null

        Object.keys(props).forEach(key => this[key] = props[key])
        
        this.cootWorker = new Worker(`${this.urlPrefix}/baby-gru/CootWorker.js`)
        this.cootWorker.onmessage = this.handleMessage.bind(this)
        this.postMessage({ message: 'CootInitialize', data: {} })
            .then(() => this.onCootInitialized && this.onCootInitialized() )
    }
    
    handleMessage(reply: WorkerResponseInterface) {
        if (this.onConsoleChanged && reply.data.consoleMessage) {
            let newMessage: string
            if (reply.data.consoleMessage.length > 160) {
                newMessage = `TRUNCATED TO [${reply.data.consoleMessage.substring(0, 160)}]`
            }
            else {
                newMessage = reply.data.consoleMessage
            }
            this.extendConsoleMessage(newMessage)
        }
        this.activeMessages.filter(
            message => message.messageId && (message.messageId === reply.data.messageId)
        ).forEach(message => {
            message.handler(reply)
        })
        this.activeMessages = this.activeMessages.filter(
            message => message.messageId !== reply.data.messageId
        )
        if (this.onActiveMessagesChanged) {
            this.onActiveMessagesChanged(this.activeMessages)
        }
    }
    
    extendConsoleMessage(newMessage: string) {
        this.consoleMessage = this.consoleMessage.concat(">" + newMessage + "\n")
        this.onConsoleChanged && this.onConsoleChanged(this.consoleMessage)
    }
    
    makeHandler(resolve) {
        return (reply) => {
            resolve(reply)
        }
    }
    
    unhook() {
        this.cootWorker.removeEventListener("message", this.handleMessage)
        this.cootWorker.terminate()
    }
    
    async cootCommand(kwargs: { returnType: any; command: any; }, doJournal: boolean = false) {
        const message = "coot_command"
        if (this.onNewCommand && doJournal) {
            console.log('In cootCommand', kwargs.command)
            this.onNewCommand(kwargs)
        }
        return this.postMessage({ message, ...kwargs })
    }
    
    postMessage(kwargs: cootCommandKwargsType) {
        const $this = this
        const messageId = uuidv4()
        return new Promise((resolve, reject) => {
            const handler = $this.makeHandler(resolve)
            this.activeMessages.push({ messageId, handler, kwargs })
            if (this.onActiveMessagesChanged) {
                this.onActiveMessagesChanged(this.activeMessages)
            }
            this.cootWorker.postMessage({
                messageId, myTimeStamp: Date.now(), ...kwargs
            })
        })
    }
}
