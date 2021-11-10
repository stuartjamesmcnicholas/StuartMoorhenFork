1. Install emscripten following:  
[https://emscripten.org/docs/getting_started/downloads.html](https://emscripten.org/docs/getting_started/downloads.html)  
Do not forget the final step (as I did!):  
`./emsdk activate latest`

2. Each time you want to use emscripten:  
`source ./emsdk_env.sh`

3. Install gsl  
Get and untar [https://mirror.ibcp.fr/pub/gnu/gsl/gsl-latest.tar.gz](https://mirror.ibcp.fr/pub/gnu/gsl/gsl-latest.tar.gz)  
`cd gls-2.7`  
`autoreconf -i`  
`emconfigure ./configure --prefix=$PWD/..`  
`emmake make LDFLAGS=-all-static`  
`emmake make install`  
`cd ..`

4. Build the CCP4 libraries and examples:  
`emcmake cmake .`  
`emmake make`

5. Run the command line examples:  
`cd example`  
`node ccp4_example.js`  
`node superpose.js 4dfr.pdb 8dfr.pdb`

6. To run the web example, put the contents of the `web_example` directory on a web server.\
This can be a full-scale web server, or a simple one, e.g:\
`cd web_example`  
`python3 -m http.server 7800 &`\
And then point a web browser at `http://localhost:7800/test.html` .
