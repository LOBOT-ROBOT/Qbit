/*
 qbit package
*/
 //% weight=10 icon="\uf013" color=#2896ff
 namespace qbit {
	
    export enum Colors {
        //% blockId="Red" block="Red"
        Red = 0x01,
        //% blockId="Green" block="Green"
        Green = 0x02,
        //% blockId="Blue" block="Blue"
        Blue = 0x03,
	//% blockId="White" block="White"
        White = 0x04,
	//% blockId="Black" block="Black"
        Black = 0x05	
    }

    export enum ObstacleSensor {
        //% block="sensor 1"
        SENSOR1_OBSTACLE = 0x01,
        //% block="sensor 2"
        SENSOR2_OBSTACLE = 0x02
    }
	
    export enum QbitRunType {
	//% block="Stop"
	STOP = 0x00,
	//% block="Run"
	RUN = 0x01	
    }

    export enum Exts {
        //% block="Ext 1"
        Ext1 = 0x00,
        //% block="Ext 2"
        Ext2 = 0x01
    }
    
    export enum pinIOStatus {
        //% block="LOW"
        Low = 0x00,
        //% block="HIGHT"
        Hight = 0x01
    }

    export enum CmdType {
        //% block="Invalid command"
        NO_COMMAND = 0,
        //% block="car run"
        CAR_RUN = 1,
        //% block="Servo"
        SERVO = 2,
        //% block="Ultrasonic distance"
        ULTRASONIC = 3,
        //% block="Temperature"
        TEMPERATURE = 4,
        //% block="Sound"
        SOUND = 5,
        //% block="Light"
        LIGHT = 6,
        //% block="Voltage"
        BAT = 7,
        //% block="Rgb light"
        RGB_LIGHT = 8,
        //% block="Honk horn"
        DIDI = 9,
        //% block="Read firmware version"
        VERSION = 10
    }

    export enum CarRunCmdType {
        //% block="Stop"
        STOP = 0,
        //% block="Go ahead"
        GO_AHEAD,
        //% block="Back"
        GO_BACK,
        //% block="Turn left"
        TURN_LEFT,
        //% block="Turn right"
        TURN_RIGHT,
        //% block="Go ahead slowly"
        GO_AHEAD_SLOW,
        //% block="Turn left slowly"
        TURN_LEFT_SLOW,
        //% block="Turn right slowly"
        TURN_RIGHT_SLOW,
        //% block="Invalid command"
        COMMAND_ERRO
     }
     
     export enum OrientionType {
        //% block="Stop"
        STOP = 0,
        //% block="Go ahead"
        GO_AHEAD = 1,
        //% block="Back"
        GO_BACK = 2,
        //% block="Turn left"
        TURN_LEFT = 3,
        //% block="Turn right"
        TURN_RIGHT = 4
     }

     export enum IRKEY {
        //% block="CH-"
        CH_MINUS=162,
        //% block="CH"
        CH=98,
        //% block="CH+"
        CH_ADD=226,
        //% block="PREV"
        PREV=34,
        //% block="NEXT"
        NEXT=2,
        //% block="PLAY/PAUSE"
        PLAY_PAUSE=194,
        //% block="+"
        ADD=168,
        //% block="-"
        MINUS=224,
        //% block="EQ"
        EQ=144,
        //% block="100+"
        _100=152,
        //% block="200+"
         _200 = 176,
        //% block="A"
        A=0x0C,
        //% block="B"
        B=0x8C,
        //% block="C"
        C = 0x4C,
        //% block="D"
        D = 0xCC,     
        //% block="E"
        E = 0xAC,   
        //% block="F"
        F = 0x5C,   
        //% block="UP"
        UP = 0X2C,
        //% block="DOWN"
        DOWN = 0X9C,  
        //% block="LEFT"
        LEFT = 0X6C,
        //% block="RIGHT"
        RIGHT = 0X1C, 
        //% block="SET"
        SET = 0XEC, 
        //% block="R0"
         R0 = 104,
        //% block="R1"
        R1=48,
        //% block="R2"
        R2=24,
        //% block="R3"
        R3=122,
        //% block="R4"
        R4=16,
        //% block="R5"
        R5=56,
        //% block="R6"
        R6=90,
        //% block="R7"
        R7=66,
        //% block="R8"     
        R8=74,
        //% block="R9"
        R9=82
    }


    let lhRGBLight: QbitRGBLight.LHQbitRGBLight;
    let obstacleSensor1: boolean = false;
    let obstacleSensor2: boolean = false;
    let currentVoltage: number = 0;
    let versionFlag: boolean = false; 
    let readTimes = 0;
     
     let MESSAGE_HEAD: number = 0xff;

     let MESSAGE_HEAD_STOP: number = 0x101;

     let adress = 0;
     let sendFlag = false;
	/**
   * Qbit initialization, please execute at boot time
  */
    //% weight=100 blockId=qbitInit block="Initialize Qbit"
    export function qbitInit() {
        initRGBLight();
        initColorSensor();
        serial.redirect(
            SerialPin.P12,
            SerialPin.P8,
            BaudRate.BaudRate115200);
         
        basic.forever(() => {
            getHandleCmd();
        });
	    basic.pause(1200);
        while(readTimes < 10 && !versionFlag)
        {
            readTimes++;
            sendVersionCmd();
            basic.pause(30)
        }
    }


    function sendVersionCmd() {
        let buf = pins.createBuffer(4);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x02;
        buf[3] = 0x12;//cmd type
        serial.writeBuffer(buf);
 }

    let handleCmd: string = "";
    /**
    * Get the handle command.
    */
    function getHandleCmd() {
        let charStr: string = serial.readString();
        handleCmd = handleCmd.concat(charStr);
        let cnt: number = countChar(handleCmd, "$");
        if (cnt == 0)
            return;
        let index = findIndexof(handleCmd, "$", 0);
        if (index != -1) {
            let cmd: string = handleCmd.substr(0, index);
            if (cmd.charAt(0).compare("C") == 0 && cmd.length == 5)
            {
                let arg1Int: number = strToNumber(cmd.substr(1,1));
                let arg2Int: number = strToNumber(cmd.substr(2,1));
                let arg3Int: number = strToNumber(cmd.substr(3,2));
                if (arg1Int != -1 && arg2Int != -1)
                {
                    if (arg1Int == 0)
                    {
                        obstacleSensor1 = true;
                    }
                    else
                    {
                        obstacleSensor1 = false;
                    }    
                    
                    if (arg2Int == 0)
                    {
                        obstacleSensor2 = true;
                    }    
                    else
                    {
                        obstacleSensor2 = false;
                    }    
                }    
                if (arg3Int != -1) {
                    if (arg3Int == 0) {
                        if (adress != 0) {
                            control.raiseEvent(MESSAGE_HEAD_STOP, 0);
                        }
                        sendFlag = false;
                        adress = 0;
                    }
                    else {
                        if (adress != arg3Int) {
                            if (!sendFlag) {
                                control.raiseEvent(MESSAGE_HEAD, arg3Int);
                                sendFlag = true;
                            }
                            adress = arg3Int
                        }
                    }
                }
            }  
            if (cmd.charAt(0).compare("U") == 0 && cmd.length == 5)
            {
                let argInt: number = decStrToNumber(cmd.substr(1, 4));
                if (argInt != -1)
                {
                    currentVoltage = argInt;
                }    
            }  
            if (cmd.charAt(0).compare("V") == 0 && cmd.length == 4)
            {
                versionFlag = true;
            }   
        }
        handleCmd = "";
    }

     function findIndexof(src: string,strFind: string,startIndex: number): number
     {
         for (let i = startIndex; i < src.length; i++)
         {
             if (src.charAt(i).compare(strFind) == 0)
             {
                 return i;
             }    
         }  
         return -1;
     }
 
     function countChar(src: string, strFind: string): number {
         let cnt: number = 0;
         for (let i = 0; i < src.length; i++)
         {
             if (src.charAt(i).compare(strFind) == 0)
             {
                 cnt++;
             }
         }
         return cnt;
    }
    
    function strToNumber(str: string): number {
        let num: number = 0;
        for (let i = 0; i < str.length; i++)
        {
            let tmp: number = converOneChar(str.charAt(i));
            if (tmp == -1)
                return -1;    
            if (i > 0)
                num *= 16;    
            num += tmp;
        }    
        return num;
    }

    function decStrToNumber(str: string): number {
        let num: number = 0;
        for (let i = 0; i < str.length; i++)
        {
            let tmp: number = converOneChar(str.charAt(i));
            if (tmp == -1)
                return -1;    
            if (i > 0)
                num *= 10;    
            num += tmp;
        }    
        return num;
    }

    function converOneChar(str: string): number {
        if (str.compare("0") >= 0 && str.compare("9") <= 0) {
            return parseInt(str);
        }
        else if (str.compare("A") >= 0 && str.compare("F") <= 0) {
            if (str.compare("A") == 0) {
                return 10;
            }
            else if (str.compare("B") == 0) {
                return 11;
            }
            else if (str.compare("C") == 0) {
                return 12;
            }
            else if (str.compare("D") == 0) {
                return 13;
            }
            else if (str.compare("E") == 0) {
                return 14;
            }
            else if (str.compare("F") == 0) {
                return 15;
            }
            return -1;  
        }
        else
            return -1; 
    }
 
    
/**
*	Set the speed of the motor, range of -100~100, that can control the Qbit running.
*/
//% weight=98 blockId=setQbitRunSpeed block="Set Qbit(V2.0 version or newer) run|speed %speed|and oriention %oriention"
//% speed.min=0 speed.max=100
export function setQbitRunSpeed(speed: number, oriention: OrientionType) {
    if (speed> 100 || speed < 0) {
        return;
    }
    let buf = pins.createBuffer(6);
    buf[0] = 0x55;
    buf[1] = 0x55;
    buf[2] = 0x04;
    buf[3] = 0x32;//cmd type
    buf[4] = speed;
    buf[5] = oriention;
    serial.writeBuffer(buf);
}    
/**
* Set the center balance angle of the Qbit
*/
//% weight=96 blockId=setBLAngle block="Set the center balance angle of the Qbit"
    export function setBLAngle() {
   let buf = pins.createBuffer(5);
   buf[0] = 0x55;
   buf[1] = 0x55;
   buf[2] = 0x03;
   buf[3] = 61;//cmd type
   buf[4] = 0;
   serial.writeBuffer(buf);
}    

 /**
  * Do someting when Qbit receive remote-control code
  * @param code the ir key button that needs to be pressed
  * @param body code to run when event is raised
  */
 //% weight=95 blockId=onQbit_remote_ir_pressed block="on remote-control|%code|pressed"
 export function onQbit_remote_ir_pressed(code: IRKEY,body: Action) {
     control.onEvent(MESSAGE_HEAD,code,body);
  }
  
 /**
  * Do someting when remote-control stop send
  * @param code the ir key button that needs to be pressed
  * @param body code to run when event is raised
  */
 //% weight=94 blockId=onQbit_remote_no_ir block="on remote-control stop send"
 export function onQbit_remote_no_ir(body: Action) {
     control.onEvent(MESSAGE_HEAD_STOP, 0, body);
 }     
     
/**
*  Obtain the distance of ultrasonic detection to the obstacle
*/
//% weight=93 blockId=Ultrasonic block="Ultrasonic distance(cm)"
   export function Ultrasonic(): number {
	   //init pins
   let echoPin:DigitalPin = DigitalPin.P13;
   let trigPin:DigitalPin = DigitalPin.P14;
   pins.setPull(echoPin, PinPullMode.PullNone);
   pins.setPull(trigPin, PinPullMode.PullNone);
		   
   // send pulse
   pins.digitalWritePin(trigPin, 0);
   control.waitMicros(5);
   pins.digitalWritePin(trigPin, 1);
   control.waitMicros(10);
   pins.digitalWritePin(trigPin, 0);
   control.waitMicros(5);
   // read pulse
   let d = pins.pulseIn(echoPin, PulseValue.High, 11600);
    basic.pause(10);
    return Math.round(d / 40);
}
    
    
/**
*  Send ultrasonic distance to control board
*/
//% weight=92 blockId=UltrasonicSend block="Send ultrasonic distance to control board"
    export function UltrasonicSend() {
    let distance = Ultrasonic();
    let buf = pins.createBuffer(6);
    buf[0] = 0x55;
    buf[1] = 0x55;
    buf[2] = 0x04;
    buf[3] = 0x33;//cmd type
    buf[4] = distance & 0xff;
    buf[5] = (distance >> 8) & 0xff;
    serial.writeBuffer(buf);
 }
   
      /**
    * Stop Qbit run.
    */
    //% weight=90 blockId=setQbitRun block="Set Qbit balance %runType"
    export function setQbitRun(runType: QbitRunType) {
        let buf = pins.createBuffer(5);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x03;
        buf[3] = 0x3C;//cmd type
	    buf[4] = runType;
        serial.writeBuffer(buf);
    }    
    
    /**
     * Detect whether avoid obstacle sensor detect obstacle
     */
    //% weight=86 blockGap=50  blockId=obstacleSensor block="avoid obstacle|%sensor|detect obstacle"
    export function obstacleSensor(sensor: ObstacleSensor): boolean {
        if (sensor == ObstacleSensor.SENSOR1_OBSTACLE)
        {
           return obstacleSensor1;
        }
        else
        {
            return obstacleSensor2;
        }    
    }

	
    /**
	 * Initialize RGB
	 */
	function initRGBLight() {
		if (!lhRGBLight) {
			lhRGBLight = QbitRGBLight.create(DigitalPin.P15, 2, QbitRGBPixelMode.RGB);
        }
        clearLight();
    }

    /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
    */
    //% blockId="setBrightness" block="set brightness %brightness"
    //% weight=84
    export function setBrightness(brightness: number): void {
        lhRGBLight.setBrightness(brightness);
    }
    
    /**
     * Set the color of the colored lights, after finished the setting please perform  the display of colored lights.
     */
    //% weight=82 blockId=setPixelRGB block="Set|%lightoffset|color to %rgb"
    export function setPixelRGB(lightoffset: Lights, rgb: QbitRGBColors)
    { 
        lhRGBLight.setPixelColor(lightoffset, rgb, versionFlag);
     }
    

    /**
     * Set RGB Color argument
     */
    //% weight=80 blockId=setPixelRGBArgs block="Set|%lightoffset|color to %rgb"
    export function setPixelRGBArgs(lightoffset: Lights, rgb: number)
    {
        lhRGBLight.setPixelColor(lightoffset, rgb, versionFlag);
    }


    /**
     * Display the colored lights, and set the color of the colored lights to match the use. After setting the color of the colored lights, the color of the lights must be displayed.
     */
    //% weight=78 blockId=showLight block="Show light"
    export function showLight() {
        lhRGBLight.show();
    }

    /**
     * Clear the color of the colored lights and turn off the lights.
     */
    //% weight=76 blockGap=50 blockId=clearLight block="Clear light"
    export function clearLight() {
        lhRGBLight.clear();
    }


	function mapRGB(x: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
		return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
     }
    

    /**
	 * Extension pin set
	 */
    //% weight=70 blockId=setExtsIO block="Set extension pin|%ext|%iostatus"
     export function setExtsIO(ext: Exts, iostatus: pinIOStatus)
     {
         if (ext == Exts.Ext1)
         {
            pins.digitalWritePin(DigitalPin.P2, iostatus);
         }   
         else if (ext == Exts.Ext2)
         {
            pins.digitalWritePin(DigitalPin.P16, iostatus);
         }    
     } 
    
    /**
	 * Extension pin read digital
	 */
    //% weight=68 blockId=readExtsIODigital block="Read extension pin|%ext|digital"
    export function readExtsIODigital(ext: Exts):boolean
    {
        let status = 0;
        if (ext == Exts.Ext1)
        {
            status = pins.digitalReadPin(DigitalPin.P2);
        }   
        else if (ext == Exts.Ext2)
        {
            status = pins.digitalReadPin(DigitalPin.P16);
        }    
	if(status == 0)
	{
		return false;
	}
	else
	{
		return true;
	}
     } 
    /**
	 * Extension  1 pin read analog
	 */
    //% weight=66 blockGap=50 blockId=readExt1Analog block="Read extension 1 pin analog"
    export function readExt1Analog():number
    {
        return pins.analogReadPin(AnalogPin.P2);
    } 

    /**
	 * Get Qbit current voltage,the unit is mV
	 */
    //% weight=64 blockId=getBatVoltage block="Get Qbit current voltage (mV)"
    export function getBatVoltage(): number {
        return currentVoltage;
    }

     /**
     * Resolve the Bluetooth that phone APP send command type, the total of nine types of commands: tank display command, servo debug command, obtaining the distance of ultrasonic command, obtaining temperature command, obtain sound size rank orders, to obtain the light level command, set the color lights command, honking command, firmware version information command.
     */
    //% weight=62 blockId=analyzeBluetoothCmd block="Get bluetooth command type %str"
    //% subcategory=Bluetooth 
    export function analyzeBluetoothCmd(str: string): number {
        if (str.length > 9)
        {
            let cmdHead = str.substr(0, 3);
            
            if (cmdHead == "CMD")
            {
                let cmdTypeStr: string = str.substr(4, 2);
                if (!checkArgsInt(cmdTypeStr))
                {
                    return CmdType.NO_COMMAND;
                }    
                let cmdType = parseInt(cmdTypeStr);

                if (cmdType > CmdType.VERSION || cmdType < 0)
                {
                    return CmdType.NO_COMMAND; 
                } 
                else
                {
                    return cmdType;
                }    
            }
            else
            {
                return CmdType.NO_COMMAND; 
            }    
        }   
        else
        {
            return CmdType.NO_COMMAND;
        }    
    }

    function checkArgsInt(str: string): boolean {
        let i = 0;
        for (; i < str.length; i++)
        {
            if (str.charAt(i) < '0' || str.charAt(i) > '9')
            {
                return false;
            }    
        }
        return true;
    }

    /**
     * Resolve the parameters that the phone APP send the command,there are 3 parameters of servo debug command,the other command has just one parameter.
     */
    //% weight=60  blockId=getArgs block="Get bluetooth command|%str|argument at %index"
    //% index.min=1 index.max=3
    //% subcategory=Bluetooth 
    export function getArgs(str: string, index: number): number {
        let cmdType = analyzeBluetoothCmd(str);
        if (cmdType == CmdType.NO_COMMAND)
        {
            return CarRunCmdType.COMMAND_ERRO;
        }
        else {
            let dataIndex = 7;
            let subLegth = 2;
            if (index == 2)
            {
                dataIndex = 10;
                subLegth = 4;
            }
            else if (index == 3)
            {
                dataIndex = 15;
                subLegth = 4;
            } 
            if (cmdType == CmdType.SERVO)
            {
                if (str.length < 19)
                {
                    return CmdType.NO_COMMAND;
                }    
            }
            if ((index == 1 && str.length < 10)||(index == 2 && str.length < 15)||(index == 3 && str.length < 19))
            {
                return 0;
            }    
            let strArgs = str.substr(dataIndex, subLegth);
            if (!checkArgsInt(strArgs))
            {
                return 0;
            }    
            let arg = parseInt(strArgs);
            return arg;
        }
    }

    /**
     * Returns the enumeration of the command type, which can be compared with this module after obtaining the bluetooth command type sent by the mobile phone APP.
     */
    //% weight=58 blockId=getBluetoothCmdtype block="Bluetooth command type %type"
    //% subcategory=Bluetooth 
    export function getBluetoothCmdtype(type: CmdType): number {
        return type;
    }

    /**
     * The command type of the tank is stop, go ahead, back, turn left, turn right, slow down, turn left slowly, turn right slowly.
     */
    //% weight=56 blockId=getRunCarType block="Car run type %type"
    //% subcategory=Bluetooth      
    export function getRunCarType(type: CarRunCmdType): number {
        return type;
    }

    /**
     * The distance from the ultrasonic obstacle to the standard command, which is sent to the mobile phone. The APP will indicate the distance of the ultrasonic obstacle.
     */
    //% weight=54 blockId=convertUltrasonic block="Convert ultrasonic distance %data"
    //% subcategory=Bluetooth  
    export function convertUltrasonic(data: number): string {
        let cmdStr: string = "CMD|03|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }

    /**
     * The conversion temperature value to standard command, sent to the mobile phone, and the APP displays the current temperature.
     */
    //% weight=52 blockId=convertTemperature block="Convert temperature %data"
    //% subcategory=Bluetooth  
    export function convertTemperature(data: number): string {
        let cmdStr: string = "CMD|04|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }

    /**
     * Convert the light value to the standard command and send it to the mobile phone. The APP displays the current light level (0~255).
     */
    //% weight=50 blockId=convertLight block="Convert light %data"
    //% subcategory=Bluetooth  
    export function convertLight(data: number): string {
        let cmdStr: string = "CMD|06|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }
    
    /**
     * Convert the battery value to the standard command and send it to the mobile phone. The APP displays the current voltage.
     */
    //% weight=48 blockId=convertBattery block="Convert battery %data"
    //% subcategory=Bluetooth  
    export function convertBattery(data: number): string {
        let cmdStr: string = "CMD|07|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }
}
