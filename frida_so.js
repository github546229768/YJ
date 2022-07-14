//-------------------------define-------------------------------
var idx = 0
var width,mheight,mwidth
var size

//-------------------------mian-------------------------------
//libByteVC1_dec_so("libByteVC1_dec.so")
//libttheif_dec_so("libttheif_dec.so")
   //使用Java hook会导致明显延迟！！！！！！
Java.perform(()=>{
	Java.use("com.bytedance.fresco.nativeheif.Heif").toRgba.overload('[B', 'int', 'boolean', 'int', 'int', 'int', 'int', 'int').implementation = function(v0,v1,v2,v3,v4,v5,v6,v7){
		send("java_size->"+v1)
		return  this.toRgba(v0,v1,v2,v3,v4,v5,v6,v7)
	}	
})
//-------------------------func-------------------------------
function libByteVC1_dec_so(so){
	var lib = Module.findBaseAddress(so)
	while(lib == null){
		lib = Module.findBaseAddress(so)
	}
	//hook(lib)
}

function libttheif_dec_so(so){
	var lib = Module.findBaseAddress(so)
	while(lib == null){
		lib = Module.findBaseAddress(so)
	}
//	sava_input_buff(lib)   //保存转yuv前的数据
//	save_output_buff(lib)  //保存转完yuv后的数据
}

function sava_input_buff(lib){
	b(lib.add(0x7ba0+1),c => {
		send("so size->"+parseInt(c.r2))
		dump(c.r1)  //byte!!!
		writeFile(Memory.readByteArray(c.r1,parseInt(c.r2)),"prepare_to_yuv.log")
	})	
}


function hook(lib){
	var addr 
	b(lib.add(0x1FE70+1),ctx => {
		printStack_so(ctx)
	})
}

function get_ByteVC1_get_frame_stride_return(){
	b(lib.add(0x6974+4+1),ctx => {
		send("ByteVC1_get_frame_stride() return ->"+ctx.r0)
	})
}
function get_ByteVC1_get_frame_data_return(){
	b(lib.add(0x695c+4+1),ctx => {
		send("ByteVC1_get_frame_data() return ->"+ctx.r0)
	})
}

function save_output_buff(lib){
	var offset = 0x6a40
	var out_buffer 
	var height
	b(lib.add(offset + 1),ctx => {
				height = ctx.sp.add(0x0018).readPointer()
				if(parseInt(height) < 0x60) return;
				send("out_buffer->"+ctx.r1+"["+idx+"]")
				send("width->"+ctx.sp.add(0x0014).readPointer())
				send("height->"+ctx.sp.add(0x0018).readPointer())
				out_buffer = ctx.r1
            },ctx => {
				if(parseInt(height) < 0x60) return;
				size = ctx.r0
				send("size->"+size)
				writeFile(Memory.readByteArray(out_buffer,parseInt(size)),"out_data_yuv.yuv")
			})
}

