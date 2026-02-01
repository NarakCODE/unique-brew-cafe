2026-01-18T09:18:12.758288382Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:2373:39: required from ‘napi_status Napi::CreateFunction(napi_env, const char*, napi_callback, CbData*, napi_value**\*_) [with CbData = MethodCallbackData<node_kerberos::KerberosServer, Value (_)(const CallbackInfo&)>; napi_env = napi_env**_; napi_callback = napi_value\_\__ (_)(napi_env\_\__, napi_callback_info**\*); napi_value = napi_value**_]’
2026-01-18T09:18:12.758365194Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4466:25: required from ‘static Napi::Function Napi::ObjectWrap<T>::DefineClass(Napi::Env, const char_, size_t, const napi_property_descriptor*, void*) [with T = node_kerberos::KerberosServer; size_t = long unsigned int]’
2026-01-18T09:18:12.758422245Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4525:21: required from ‘static Napi::Function Napi::ObjectWrap<T>::DefineClass(Napi::Env, const char*, const std::initializer_list<Napi::ClassPropertyDescriptor<T> >&, void*) [with T = node_kerberos::KerberosServer]’
2026-01-18T09:18:12.758491697Z .../kerberos@2.1.0/node_modules/kerberos install: ../src/kerberos.cc:95:20: required from here
2026-01-18T09:18:12.758548418Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:68:47: error: invalid conversion from ‘napi_finalize’ {aka ‘void (_)(napi_env\_\__, void*, void*)’} to ‘node_api_basic_finalize’ {aka ‘void (_)(const napi_env\_\__, void*, void*)’} [-fpermissive]
2026-01-18T09:18:12.758616719Z .../kerberos@2.1.0/node_modules/kerberos install: 68 | status = napi_add_finalizer(env, obj, data, finalizer, hint, nullptr);
2026-01-18T09:18:12.7586616Z .../kerberos@2.1.0/node_modules/kerberos install: | ^~~~~~~~~
2026-01-18T09:18:12.758710401Z .../kerberos@2.1.0/node_modules/kerberos install: | |
2026-01-18T09:18:12.758752642Z .../kerberos@2.1.0/node_modules/kerberos install: | napi_finalize {aka void (_)(napi_env\_\__, void*, void*)}
2026-01-18T09:18:12.758815724Z .../kerberos@2.1.0/node_modules/kerberos install: /opt/render/.cache/25.3.0/include/node/js_native_api.h:527:44: note: initializing argument 4 of ‘napi_status napi_add_finalizer(napi_env, napi_value, void*, node_api_basic_finalize, void*, napi_ref**\*_)’
2026-01-18T09:18:12.758858765Z .../kerberos@2.1.0/node_modules/kerberos install: 527 | node_api_basic_finalize finalize_cb,
2026-01-18T09:18:12.758904746Z .../kerberos@2.1.0/node_modules/kerberos install: | ~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~
2026-01-18T09:18:12.758969627Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h: In instantiation of ‘napi_status Napi::details::AttachData(napi_env, napi_value, FreeType_, napi_finalize, void*) [with FreeType = Napi::MethodCallbackData<node_kerberos::KerberosServer, void (*)(const Napi::CallbackInfo&)>; napi_env = napi_env**_; napi_value = napi_value\_\__; napi_finalize = void (_)(napi_env\_\__, void*, void*)]’:
2026-01-18T09:18:12.759018558Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:2373:39: required from ‘napi_status Napi::CreateFunction(napi_env, const char*, napi_callback, CbData*, napi_value**\*_) [with CbData = MethodCallbackData<node_kerberos::KerberosServer, void (_)(const CallbackInfo&)>; napi_env = napi_env**_; napi_callback = napi_value\_\__ (_)(napi_env\_\__, napi_callback_info**\*); napi_value = napi_value**_]’
2026-01-18T09:18:12.7590857Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4476:25: required from ‘static Napi::Function Napi::ObjectWrap<T>::DefineClass(Napi::Env, const char_, size_t, const napi_property_descriptor*, void*) [with T = node_kerberos::KerberosServer; size_t = long unsigned int]’
2026-01-18T09:18:12.759132091Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4525:21: required from ‘static Napi::Function Napi::ObjectWrap<T>::DefineClass(Napi::Env, const char*, const std::initializer_list<Napi::ClassPropertyDescriptor<T> >&, void*) [with T = node_kerberos::KerberosServer]’
2026-01-18T09:18:12.759172402Z .../kerberos@2.1.0/node_modules/kerberos install: ../src/kerberos.cc:95:20: required from here
2026-01-18T09:18:12.759259494Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:68:47: error: invalid conversion from ‘napi_finalize’ {aka ‘void (_)(napi_env\_\__, void*, void*)’} to ‘node_api_basic_finalize’ {aka ‘void (_)(const napi_env\_\__, void*, void*)’} [-fpermissive]
2026-01-18T09:18:12.759303915Z .../kerberos@2.1.0/node_modules/kerberos install: 68 | status = napi_add_finalizer(env, obj, data, finalizer, hint, nullptr);
2026-01-18T09:18:12.759354986Z .../kerberos@2.1.0/node_modules/kerberos install: | ^~~~~~~~~
2026-01-18T09:18:12.759421027Z .../kerberos@2.1.0/node_modules/kerberos install: | |
2026-01-18T09:18:12.759426147Z .../kerberos@2.1.0/node_modules/kerberos install: | napi_finalize {aka void (_)(napi_env\_\__, void*, void*)}
2026-01-18T09:18:12.759505279Z .../kerberos@2.1.0/node_modules/kerberos install: /opt/render/.cache/25.3.0/include/node/js_native_api.h:527:44: note: initializing argument 4 of ‘napi_status napi_add_finalizer(napi_env, napi_value, void*, node_api_basic_finalize, void*, napi_ref**\*_)’
2026-01-18T09:18:12.75954043Z .../kerberos@2.1.0/node_modules/kerberos install: 527 | node_api_basic_finalize finalize_cb,
2026-01-18T09:18:12.759587821Z .../kerberos@2.1.0/node_modules/kerberos install: | ~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~
2026-01-18T09:18:12.759722864Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h: In instantiation of ‘napi_status Napi::details::AttachData(napi_env, napi_value, FreeType_, napi_finalize, void*) [with FreeType = Napi::MethodCallbackData<node_kerberos::KerberosServer, void (node_kerberos::KerberosServer::*)(const Napi::CallbackInfo&)>; napi_env = napi_env**_; napi_value = napi_value\_\__; napi_finalize = void (_)(napi_env\_\__, void*, void*)]’:
2026-01-18T09:18:12.759778135Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4113:41: required from ‘static void Napi::InstanceWrap<T>::AttachPropData(napi_env, napi_value, const napi_property_descriptor*) [with T = node_kerberos::KerberosServer; napi_env = napi_env\_\_*; napi_value = napi_value**_]’
2026-01-18T09:18:12.759865917Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4512:24: required from ‘static Napi::Function Napi::ObjectWrap<T>::DefineClass(Napi::Env, const char_, size_t, const napi_property_descriptor*, void*) [with T = node_kerberos::KerberosServer; size_t = long unsigned int]’
2026-01-18T09:18:12.759910358Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4525:21: required from ‘static Napi::Function Napi::ObjectWrap<T>::DefineClass(Napi::Env, const char*, const std::initializer_list<Napi::ClassPropertyDescriptor<T> >&, void*) [with T = node_kerberos::KerberosServer]’
2026-01-18T09:18:12.759984559Z .../kerberos@2.1.0/node_modules/kerberos install: ../src/kerberos.cc:95:20: required from here
2026-01-18T09:18:12.760036591Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:68:47: error: invalid conversion from ‘napi_finalize’ {aka ‘void (\*)(napi_env**_, void_, void*)’} to ‘node_api_basic_finalize’ {aka ‘void (*)(const napi_env**_, void_, void*)’} [-fpermissive]
2026-01-18T09:18:12.760106622Z .../kerberos@2.1.0/node_modules/kerberos install: 68 | status = napi_add_finalizer(env, obj, data, finalizer, hint, nullptr);
2026-01-18T09:18:12.760136943Z .../kerberos@2.1.0/node_modules/kerberos install: | ^~~~~~~~~
2026-01-18T09:18:12.760176214Z .../kerberos@2.1.0/node_modules/kerberos install: | |
2026-01-18T09:18:12.760241135Z .../kerberos@2.1.0/node_modules/kerberos install: | napi_finalize {aka void (*)(napi_env**_, void_, void*)}
2026-01-18T09:18:12.760302517Z .../kerberos@2.1.0/node_modules/kerberos install: /opt/render/.cache/25.3.0/include/node/js_native_api.h:527:44: note: initializing argument 4 of ‘napi_status napi_add_finalizer(napi_env, napi_value, void*, node_api_basic_finalize, void*, napi_ref\_\_\*\*)’
2026-01-18T09:18:12.760397199Z .../kerberos@2.1.0/node_modules/kerberos install: 527 | node_api_basic_finalize finalize_cb,
2026-01-18T09:18:12.76044118Z .../kerberos@2.1.0/node_modules/kerberos install: | ~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~
2026-01-18T09:18:12.760568032Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h: In instantiation of ‘napi_status Napi::details::AttachData(napi_env, napi_value, FreeType*, napi_finalize, void*) [with FreeType = Napi::MethodCallbackData<node_kerberos::KerberosServer, Napi::Value (node_kerberos::KerberosServer::*)(const Napi::CallbackInfo&)>; napi_env = napi_env**\*; napi_value = napi_value**_; napi_finalize = void (_)(napi_env**_, void_, void*)]’:
2026-01-18T09:18:12.760682095Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4117:41: required from ‘static void Napi::InstanceWrap<T>::AttachPropData(napi_env, napi_value, const napi_property_descriptor*) [with T = node_kerberos::KerberosServer; napi_env = napi_env**_; napi_value = napi_value\_\__]’
2026-01-18T09:18:12.760760097Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4512:24: required from ‘static Napi::Function Napi::ObjectWrap<T>::DefineClass(Napi::Env, const char*, size_t, const napi_property_descriptor*, void*) [with T = node_kerberos::KerberosServer; size_t = long unsigned int]’
2026-01-18T09:18:12.760869959Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4525:21: required from ‘static Napi::Function Napi::ObjectWrap<T>::DefineClass(Napi::Env, const char*, const std::initializer_list<Napi::ClassPropertyDescriptor<T> >&, void*) [with T = node_kerberos::KerberosServer]’
2026-01-18T09:18:12.760947221Z .../kerberos@2.1.0/node_modules/kerberos install: ../src/kerberos.cc:95:20: required from here
2026-01-18T09:18:12.761054053Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:68:47: error: invalid conversion from ‘napi_finalize’ {aka ‘void (*)(napi_env**_, void_, void*)’} to ‘node_api_basic_finalize’ {aka ‘void (*)(const napi_env**_, void_, void*)’} [-fpermissive]
2026-01-18T09:18:12.761133405Z .../kerberos@2.1.0/node_modules/kerberos install: 68 | status = napi_add_finalizer(env, obj, data, finalizer, hint, nullptr);
2026-01-18T09:18:12.761247378Z .../kerberos@2.1.0/node_modules/kerberos install: | ^~~~~~~~~
2026-01-18T09:18:12.761318719Z .../kerberos@2.1.0/node_modules/kerberos install: | |
2026-01-18T09:18:12.761423822Z .../kerberos@2.1.0/node_modules/kerberos install: | napi_finalize {aka void (*)(napi_env**_, void_, void*)}
2026-01-18T09:18:12.761548644Z .../kerberos@2.1.0/node_modules/kerberos install: /opt/render/.cache/25.3.0/include/node/js_native_api.h:527:44: note: initializing argument 4 of ‘napi_status napi_add_finalizer(napi_env, napi_value, void*, node_api_basic_finalize, void\*, napi_ref****)’
2026-01-18T09:18:12.761640116Z .../kerberos@2.1.0/node_modules/kerberos install: 527 | node_api_basic_finalize finalize_cb,
2026-01-18T09:18:12.761715858Z .../kerberos@2.1.0/node_modules/kerberos install: | ~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~
2026-01-18T09:18:12.7618337Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h: In instantiation of ‘napi_status Napi::details::AttachData(napi_env, napi_value, FreeType*, napi_finalize, void*) [with FreeType = Napi::AccessorCallbackData<node_kerberos::KerberosServer, Napi::Value (node_kerberos::KerberosServer::*)(const Napi::CallbackInfo&), void (node_kerberos::KerberosServer::*)(const Napi::CallbackInfo&, const Napi::Value&)>; napi_env = napi_env__*; napi_value = napi_value__*; napi_finalize = void (*)(napi_env__*, void*, void*)]’:
2026-01-18T09:18:12.761950413Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4122:41: required from ‘static void Napi::InstanceWrap<T>::AttachPropData(napi_env, napi_value, const napi_property_descriptor*) [with T = node_kerberos::KerberosServer; napi_env = napi_env\_\_*; napi_value = napi_value**_]’
2026-01-18T09:18:12.762048815Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4512:24: required from ‘static Napi::Function Napi::ObjectWrap<T>::DefineClass(Napi::Env, const char_, size_t, const napi_property_descriptor*, void*) [with T = node_kerberos::KerberosServer; size_t = long unsigned int]’
2026-01-18T09:18:12.762169328Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:4525:21: required from ‘static Napi::Function Napi::ObjectWrap<T>::DefineClass(Napi::Env, const char*, const std::initializer_list<Napi::ClassPropertyDescriptor<T> >&, void*) [with T = node_kerberos::KerberosServer]’
2026-01-18T09:18:12.762233429Z .../kerberos@2.1.0/node_modules/kerberos install: ../src/kerberos.cc:95:20: required from here
2026-01-18T09:18:12.762327911Z .../kerberos@2.1.0/node_modules/kerberos install: ../../../../node-addon-api@6.1.0/node_modules/node-addon-api/napi-inl.h:68:47: error: invalid conversion from ‘napi_finalize’ {aka ‘void (\*)(napi_env**_, void_, void*)’} to ‘node_api_basic_finalize’ {aka ‘void (*)(const napi_env**_, void_, void*)’} [-fpermissive]
2026-01-18T09:18:12.762367742Z .../kerberos@2.1.0/node_modules/kerberos install: 68 | status = napi_add_finalizer(env, obj, data, finalizer, hint, nullptr);
2026-01-18T09:18:12.762444834Z .../kerberos@2.1.0/node_modules/kerberos install: | ^~~~~~~~~
2026-01-18T09:18:12.762489425Z .../kerberos@2.1.0/node_modules/kerberos install: | |
2026-01-18T09:18:12.762567197Z .../kerberos@2.1.0/node_modules/kerberos install: | napi_finalize {aka void (*)(napi_env**_, void_, void*)}
2026-01-18T09:18:12.762635258Z .../kerberos@2.1.0/node_modules/kerberos install: /opt/render/.cache/25.3.0/include/node/js_native_api.h:527:44: note: initializing argument 4 of ‘napi_status napi_add_finalizer(napi_env, napi_value, void*, node_api_basic_finalize, void\*, napi_ref\_\_**)’
2026-01-18T09:18:12.76269215Z .../kerberos@2.1.0/node_modules/kerberos install: 527 | node_api_basic_finalize finalize_cb,
2026-01-18T09:18:12.762739931Z .../kerberos@2.1.0/node_modules/kerberos install: | ~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~
2026-01-18T09:18:12.762875054Z .../node_modules/cpu-features install: In file included from /opt/render/.cache/25.3.0/include/node/v8-array-buffer.h:14,
2026-01-18T09:18:12.762946845Z .../node_modules/cpu-features install: from /opt/render/.cache/25.3.0/include/node/v8.h:24,
2026-01-18T09:18:12.763009566Z .../node_modules/cpu-features install: from /opt/render/.cache/25.3.0/include/node/node.h:74,
2026-01-18T09:18:12.763054687Z .../node_modules/cpu-features install: from ../src/binding.cc:1:
2026-01-18T09:18:12.763151669Z .../node_modules/cpu-features install: /opt/render/.cache/25.3.0/include/node/v8-object.h: In static member function ‘static v8::Isolate* v8::Object::GetIsolate(const v8::TracedReference<v8::Object>&)’:
2026-01-18T09:18:12.763223351Z .../node_modules/cpu-features install: /opt/render/.cache/25.3.0/include/node/v8-object.h:863:55: warning: ‘v8::Isolate* v8::Object::GetIsolate()’ is deprecated: Use Isolate::GetCurrent() instead, which is guaranteed to return the same isolate since https://crrev.com/c/6458560. [-Wdeprecated-declarations]
2026-01-18T09:18:12.763293923Z .../node_modules/cpu-features install: 863 | return handle.template value<Object>()->GetIsolate();
2026-01-18T09:18:12.763381685Z .../node_modules/cpu-features install: | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~
2026-01-18T09:18:12.763453126Z .../node_modules/cpu-features install: /opt/render/.cache/25.3.0/include/node/v8-object.h:857:12: note: declared here
2026-01-18T09:18:12.763518138Z .../node_modules/cpu-features install: 857 | Isolate\* GetIsolate();
2026-01-18T09:18:12.763561698Z .../node_modules/cpu-features install: | ^~~~~~~~~~
2026-01-18T09:18:13.009763152Z .../kerberos@2.1.0/node_modules/kerberos install: make: _\*\* [kerberos.target.mk:111: Release/obj.target/kerberos/src/kerberos.o] Error 1
2026-01-18T09:18:13.009890925Z .../kerberos@2.1.0/node_modules/kerberos install: make: Leaving directory '/opt/render/project/src/node_modules/.pnpm/kerberos@2.1.0/node_modules/kerberos/build'
2026-01-18T09:18:13.011421958Z .../kerberos@2.1.0/node_modules/kerberos install: gyp ERR! build error
2026-01-18T09:18:13.011547431Z .../kerberos@2.1.0/node_modules/kerberos install: gyp ERR! stack Error: `make` failed with exit code: 2
2026-01-18T09:18:13.011584942Z .../kerberos@2.1.0/node_modules/kerberos install: gyp ERR! stack at ChildProcess.<anonymous> (/opt/render/.local/share/pnpm/.tools/pnpm/9.0.0_tmp_132/node_modules/pnpm/dist/node_modules/node-gyp/lib/build.js:209:23)
2026-01-18T09:18:13.011699995Z .../kerberos@2.1.0/node_modules/kerberos install: gyp ERR! System Linux 6.8.0-1044-aws
2026-01-18T09:18:13.011765006Z .../kerberos@2.1.0/node_modules/kerberos install: gyp ERR! command "/opt/render/project/nodes/node-25.3.0/bin/node" "/opt/render/.local/share/pnpm/.tools/pnpm/9.0.0_tmp_132/node_modules/pnpm/dist/node_modules/node-gyp/bin/node-gyp.js" "rebuild"
2026-01-18T09:18:13.011867988Z .../kerberos@2.1.0/node_modules/kerberos install: gyp ERR! cwd /opt/render/project/src/node_modules/.pnpm/kerberos@2.1.0/node_modules/kerberos
2026-01-18T09:18:13.011890929Z .../kerberos@2.1.0/node_modules/kerberos install: gyp ERR! node -v v25.3.0
2026-01-18T09:18:13.012066093Z .../kerberos@2.1.0/node_modules/kerberos install: gyp ERR! node-gyp -v v10.1.0
2026-01-18T09:18:13.012146365Z .../kerberos@2.1.0/node_modules/kerberos install: gyp ERR! not ok
2026-01-18T09:18:13.024528848Z .../kerberos@2.1.0/node_modules/kerberos install: Failed
2026-01-18T09:18:13.109293022Z .../node_modules/cpu-features install: In file included from ../src/binding.cc:3:
2026-01-18T09:18:13.109367854Z .../node_modules/cpu-features install: ../../../../nan@2.23.1/node_modules/nan/nan.h: In function ‘v8::Local<v8::Value> Nan::Encode(const void_, size_t, Encoding)’:
2026-01-18T09:18:13.109457996Z .../node_modules/cpu-features install: ../../../../nan@2.23.1/node_modules/nan/nan.h:2424:24: warning: ‘v8::Local<v8::Value> node::Encode(v8::Isolate*, const uint16_t*, size_t)’ is deprecated: Use TryEncode(...) instead [-Wdeprecated-declarations]
2026-01-18T09:18:13.109530247Z .../node_modules/cpu-features install: 2424 | return node::Encode(
2026-01-18T09:18:13.10961994Z .../node_modules/cpu-features install: | ~~~~~~~~~~~~^
2026-01-18T09:18:13.109680421Z .../node_modules/cpu-features install: 2425 | isolate
2026-01-18T09:18:13.109736572Z .../node_modules/cpu-features install: | ~~~~~~~
2026-01-18T09:18:13.109816434Z .../node_modules/cpu-features install: 2426 | , reinterpret_cast<const uint16_t \*>(buf)
2026-01-18T09:18:13.109860925Z .../node_modules/cpu-features install: | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
2026-01-18T09:18:13.109977807Z .../node_modules/cpu-features install: 2427 | , len / 2);
2026-01-18T09:18:13.110041759Z .../node_modules/cpu-features install: | ~~~~~~~~~~
2026-01-18T09:18:13.11011486Z .../node_modules/cpu-features install: /opt/render/.cache/25.3.0/include/node/node.h:1132:50: note: declared here
2026-01-18T09:18:13.110174202Z .../node_modules/cpu-features install: 1132 | NODE_EXTERN v8::Local<v8::Value> Encode(v8::Isolate* isolate,
2026-01-18T09:18:13.110275234Z .../node_modules/cpu-features install: | ^~~~~~
2026-01-18T09:18:13.110335605Z .../node_modules/cpu-features install: /opt/render/.cache/25.3.0/include/node/node.h:116:42: note: in definition of macro ‘NODE_DEPRECATED’
2026-01-18T09:18:13.110404147Z .../node_modules/cpu-features install: 116 | **attribute**((deprecated(message))) declarator
2026-01-18T09:18:13.110454268Z .../node_modules/cpu-features install: | ^~~~~~~~~~
2026-01-18T09:18:13.110622242Z .../node_modules/cpu-features install: ../../../../nan@2.23.1/node_modules/nan/nan.h:2429:24: warning: ‘v8::Local<v8::Value> node::Encode(v8::Isolate*, const char*, size_t, encoding)’ is deprecated: Use TryEncode(...) instead [-Wdeprecated-declarations]
2026-01-18T09:18:13.110675493Z .../node_modules/cpu-features install: 2429 | return node::Encode(
2026-01-18T09:18:13.110749394Z .../node_modules/cpu-features install: | ~~~~~~~~~~~~^
2026-01-18T09:18:13.110801015Z .../node_modules/cpu-features install: 2430 | isolate
2026-01-18T09:18:13.110870997Z .../node_modules/cpu-features install: | ~~~~~~~
2026-01-18T09:18:13.110920228Z .../node_modules/cpu-features install: 2431 | , reinterpret_cast<const char *>(buf)
2026-01-18T09:18:13.11099251Z .../node_modules/cpu-features install: | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
2026-01-18T09:18:13.111077582Z .../node_modules/cpu-features install: 2432 | , len
2026-01-18T09:18:13.111142003Z .../node_modules/cpu-features install: | ~~~~~
2026-01-18T09:18:13.111225585Z .../node_modules/cpu-features install: 2433 | , node_enc);
2026-01-18T09:18:13.111311657Z .../node_modules/cpu-features install: | ~~~~~~~~~~~
2026-01-18T09:18:13.111350048Z .../node_modules/cpu-features install: /opt/render/.cache/25.3.0/include/node/node.h:1124:38: note: declared here
2026-01-18T09:18:13.111411029Z .../node_modules/cpu-features install: 1124 | NODE_EXTERN v8::Local<v8::Value> Encode(v8::Isolate\* isolate,
2026-01-18T09:18:13.11145373Z .../node_modules/cpu-features install: | ^~~~~~
2026-01-18T09:18:13.111543392Z .../node_modules/cpu-features install: /opt/render/.cache/25.3.0/include/node/node.h:116:42: note: in definition of macro ‘NODE_DEPRECATED’
2026-01-18T09:18:13.111585323Z .../node_modules/cpu-features install: 116 | **attribute**((deprecated(message))) declarator
2026-01-18T09:18:13.111661225Z .../node_modules/cpu-features install: | ^~~~~~~~~~
2026-01-18T09:18:13.14943802Z .../node_modules/cpu-features install: ../src/binding.cc: At global scope:
2026-01-18T09:18:13.149523622Z .../node_modules/cpu-features install: /opt/render/.cache/25.3.0/include/node/node.h:1222:7: warning: cast between incompatible function types from ‘void (_)(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE)’ {aka ‘void (_)(v8::Local<v8::Object>)’} to ‘node::addon_register_func’ {aka ‘void (_)(v8::Local<v8::Object>, v8::Local<v8::Value>, void_)’} [-Wcast-function-type]
2026-01-18T09:18:13.149610693Z .../node_modules/cpu-features install: 1222 | (node::addon_register_func) (regfunc), \
2026-01-18T09:18:13.149678205Z .../node_modules/cpu-features install: | ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
2026-01-18T09:18:13.149779987Z .../node_modules/cpu-features install: /opt/render/.cache/25.3.0/include/node/node.h:1256:3: note: in expansion of macro ‘NODE_MODULE_X’
2026-01-18T09:18:13.149842819Z .../node_modules/cpu-features install: 1256 | NODE_MODULE_X(modname, regfunc, NULL, 0) // NOLINT (readability/null_usage)
2026-01-18T09:18:13.149923751Z .../node_modules/cpu-features install: | ^~~~~~~~~~~~~
2026-01-18T09:18:13.149996962Z .../node_modules/cpu-features install: ../src/binding.cc:151:1: note: in expansion of macro ‘NODE_MODULE’
2026-01-18T09:18:13.150075324Z .../node_modules/cpu-features install: 151 | NODE_MODULE(cpufeatures, init)
2026-01-18T09:18:13.150140725Z .../node_modules/cpu-features install: | ^~~~~~~~~~~
2026-01-18T09:18:13.971629847Z .../node_modules/cpu-features install: SOLINK_MODULE(target) Release/obj.target/cpufeatures.node
2026-01-18T09:18:14.046619235Z .../node_modules/cpu-features install: COPY Release/cpufeatures.node
2026-01-18T09:18:14.052327491Z .../node_modules/cpu-features install: make: Leaving directory '/opt/render/project/src/node_modules/.pnpm/cpu-features@0.0.10/node_modules/cpu-features/build'
2026-01-18T09:18:14.070337539Z .../node_modules/cpu-features install: Done
2026-01-18T09:18:14.754693129Z .../node_modules/os-dns-native install: SOLINK_MODULE(target) Release/obj.target/os_dns_native.node
2026-01-18T09:18:14.81128746Z .../node_modules/os-dns-native install: COPY Release/os_dns_native.node
2026-01-18T09:18:14.816894234Z .../node_modules/os-dns-native install: make: Leaving directory '/opt/render/project/src/node_modules/.pnpm/os-dns-native@1.2.1/node_modules/os-dns-native/build'
2026-01-18T09:18:14.834499713Z .../node_modules/os-dns-native install: Done
2026-01-18T09:18:14.841814395Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install$ node install.js
2026-01-18T09:18:15.254661832Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: make: Entering directory '/opt/render/project/src/node_modules/.pnpm/ssh2@1.17.0/node_modules/ssh2/lib/protocol/crypto/build'
2026-01-18T09:18:15.255451689Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: CXX(target) Release/obj.target/sshcrypto/src/binding.o
2026-01-18T09:18:16.032566219Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: In file included from /opt/render/.cache/25.3.0/include/node/v8-array-buffer.h:14,
2026-01-18T09:18:16.032711922Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: from /opt/render/.cache/25.3.0/include/node/v8.h:24,
2026-01-18T09:18:16.032808014Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: from /opt/render/.cache/25.3.0/include/node/node.h:74,
2026-01-18T09:18:16.032901727Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: from ../src/binding.cc:14:
2026-01-18T09:18:16.03304996Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/v8-object.h: In static member function ‘static v8::Isolate* v8::Object::GetIsolate(const v8::TracedReference<v8::Object>&)’:
2026-01-18T09:18:16.033140602Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/v8-object.h:863:55: warning: ‘v8::Isolate* v8::Object::GetIsolate()’ is deprecated: Use Isolate::GetCurrent() instead, which is guaranteed to return the same isolate since https://crrev.com/c/6458560. [-Wdeprecated-declarations]
2026-01-18T09:18:16.033244944Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 863 | return handle.template value<Object>()->GetIsolate();
2026-01-18T09:18:16.033335536Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~
2026-01-18T09:18:16.033391217Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/v8-object.h:857:12: note: declared here
2026-01-18T09:18:16.033458959Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 857 | Isolate\* GetIsolate();
2026-01-18T09:18:16.03350409Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ^~~~~~~~~~
2026-01-18T09:18:16.483524588Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: In file included from ../src/binding.cc:16:
2026-01-18T09:18:16.48359847Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../../../../../../../nan@2.23.1/node_modules/nan/nan.h: In function ‘v8::Local<v8::Value> Nan::Encode(const void*, size_t, Encoding)’:
2026-01-18T09:18:16.483704922Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../../../../../../../nan@2.23.1/node_modules/nan/nan.h:2424:24: warning: ‘v8::Local<v8::Value> node::Encode(v8::Isolate*, const uint16_t\*, size_t)’ is deprecated: Use TryEncode(...) instead [-Wdeprecated-declarations]
2026-01-18T09:18:16.483779824Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 2424 | return node::Encode(
2026-01-18T09:18:16.483869366Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~~~^
2026-01-18T09:18:16.483928877Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 2425 | isolate
2026-01-18T09:18:16.483991899Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~
2026-01-18T09:18:16.48406272Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 2426 | , reinterpret_cast<const uint16_t \*>(buf)
2026-01-18T09:18:16.484137342Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
2026-01-18T09:18:16.484239074Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 2427 | , len / 2);
2026-01-18T09:18:16.484300685Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~
2026-01-18T09:18:16.484374717Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/node.h:1132:50: note: declared here
2026-01-18T09:18:16.484444678Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 1132 | NODE_EXTERN v8::Local<v8::Value> Encode(v8::Isolate* isolate,
2026-01-18T09:18:16.48450674Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ^~~~~~
2026-01-18T09:18:16.484583442Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/node.h:116:42: note: in definition of macro ‘NODE_DEPRECATED’
2026-01-18T09:18:16.484648773Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 116 | **attribute**((deprecated(message))) declarator
2026-01-18T09:18:16.484748365Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ^~~~~~~~~~
2026-01-18T09:18:16.484921329Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../../../../../../../nan@2.23.1/node_modules/nan/nan.h:2429:24: warning: ‘v8::Local<v8::Value> node::Encode(v8::Isolate*, const char*, size_t, encoding)’ is deprecated: Use TryEncode(...) instead [-Wdeprecated-declarations]
2026-01-18T09:18:16.484988841Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 2429 | return node::Encode(
2026-01-18T09:18:16.485050902Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~~~^
2026-01-18T09:18:16.485113753Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 2430 | isolate
2026-01-18T09:18:16.485178005Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~
2026-01-18T09:18:16.485266627Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 2431 | , reinterpret_cast<const char *>(buf)
2026-01-18T09:18:16.485324988Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
2026-01-18T09:18:16.48540004Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 2432 | , len
2026-01-18T09:18:16.485520012Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~
2026-01-18T09:18:16.485597234Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 2433 | , node_enc);
2026-01-18T09:18:16.485666716Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~~
2026-01-18T09:18:16.485731097Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/node.h:1124:38: note: declared here
2026-01-18T09:18:16.485808219Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 1124 | NODE_EXTERN v8::Local<v8::Value> Encode(v8::Isolate\* isolate,
2026-01-18T09:18:16.48586259Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ^~~~~~
2026-01-18T09:18:16.485977243Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/node.h:116:42: note: in definition of macro ‘NODE_DEPRECATED’
2026-01-18T09:18:16.486024573Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 116 | **attribute**((deprecated(message))) declarator
2026-01-18T09:18:16.486142666Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ^~~~~~~~~~
2026-01-18T09:18:16.543377352Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../src/binding.cc: In static member function ‘static void ChaChaPolyCipher::Init(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE)’:
2026-01-18T09:18:16.543419002Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../src/binding.cc:89:47: warning: ‘v8::Isolate* v8::Context::GetIsolate()’ is deprecated: Use Isolate::GetCurrent() instead, which is guaranteed to return the same isolate since https://crrev.com/c/6458560. [-Wdeprecated-declarations]
2026-01-18T09:18:16.543498384Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 89 | v8::Isolate* isolate = context->GetIsolate();
2026-01-18T09:18:16.543593266Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~~~~~~~~~~^~
2026-01-18T09:18:16.543727219Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: In file included from /opt/render/.cache/25.3.0/include/node/v8.h:26:
2026-01-18T09:18:16.543792771Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/v8-context.h:262:12: note: declared here
2026-01-18T09:18:16.543862112Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 262 | Isolate* GetIsolate();
2026-01-18T09:18:16.543898133Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ^~~~~~~~~~
2026-01-18T09:18:16.54783617Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../src/binding.cc: In static member function ‘static void AESGCMCipher::Init(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE)’:
2026-01-18T09:18:16.547923552Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../src/binding.cc:423:47: warning: ‘v8::Isolate* v8::Context::GetIsolate()’ is deprecated: Use Isolate::GetCurrent() instead, which is guaranteed to return the same isolate since https://crrev.com/c/6458560. [-Wdeprecated-declarations]
2026-01-18T09:18:16.548004994Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 423 | v8::Isolate* isolate = context->GetIsolate();
2026-01-18T09:18:16.548106316Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~~~~~~~~~~^~
2026-01-18T09:18:16.548145167Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/v8-context.h:262:12: note: declared here
2026-01-18T09:18:16.548201158Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 262 | Isolate* GetIsolate();
2026-01-18T09:18:16.548256809Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ^~~~~~~~~~
2026-01-18T09:18:16.551396559Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../src/binding.cc: In static member function ‘static void GenericCipher::Init(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE)’:
2026-01-18T09:18:16.5514727Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../src/binding.cc:664:47: warning: ‘v8::Isolate* v8::Context::GetIsolate()’ is deprecated: Use Isolate::GetCurrent() instead, which is guaranteed to return the same isolate since https://crrev.com/c/6458560. [-Wdeprecated-declarations]
2026-01-18T09:18:16.551546732Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 664 | v8::Isolate* isolate = context->GetIsolate();
2026-01-18T09:18:16.551552872Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~~~~~~~~~~^~
2026-01-18T09:18:16.551606473Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/v8-context.h:262:12: note: declared here
2026-01-18T09:18:16.551674725Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 262 | Isolate\* GetIsolate();
2026-01-18T09:18:16.551685215Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ^~~~~~~~~~
2026-01-18T09:18:16.556236936Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../src/binding.cc: In static member function ‘static void ChaChaPolyDecipher::Init(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE)’:
2026-01-18T09:18:16.556280207Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../src/binding.cc:1061:47: warning: ‘v8::Isolate* v8::Context::GetIsolate()’ is deprecated: Use Isolate::GetCurrent() instead, which is guaranteed to return the same isolate since https://crrev.com/c/6458560. [-Wdeprecated-declarations]
2026-01-18T09:18:16.556386699Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 1061 | v8::Isolate* isolate = context->GetIsolate();
2026-01-18T09:18:16.556477701Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~~~~~~~~~~^~
2026-01-18T09:18:16.556628825Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/v8-context.h:262:12: note: declared here
2026-01-18T09:18:16.556689956Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 262 | Isolate* GetIsolate();
2026-01-18T09:18:16.556838429Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ^~~~~~~~~~
2026-01-18T09:18:16.561181675Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../src/binding.cc: In static member function ‘static void AESGCMDecipher::Init(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE)’:
2026-01-18T09:18:16.561271787Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../src/binding.cc:1489:47: warning: ‘v8::Isolate* v8::Context::GetIsolate()’ is deprecated: Use Isolate::GetCurrent() instead, which is guaranteed to return the same isolate since https://crrev.com/c/6458560. [-Wdeprecated-declarations]
2026-01-18T09:18:16.561335158Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 1489 | v8::Isolate* isolate = context->GetIsolate();
2026-01-18T09:18:16.56141717Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~~~~~~~~~~^~
2026-01-18T09:18:16.561438621Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/v8-context.h:262:12: note: declared here
2026-01-18T09:18:16.561553313Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 262 | Isolate* GetIsolate();
2026-01-18T09:18:16.561573924Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ^~~~~~~~~~
2026-01-18T09:18:16.567667758Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../src/binding.cc: In static member function ‘static void GenericDecipher::Init(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE)’:
2026-01-18T09:18:16.567814232Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: ../src/binding.cc:1741:47: warning: ‘v8::Isolate* v8::Context::GetIsolate()’ is deprecated: Use Isolate::GetCurrent() instead, which is guaranteed to return the same isolate since https://crrev.com/c/6458560. [-Wdeprecated-declarations]
2026-01-18T09:18:16.567915304Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 1741 | v8::Isolate* isolate = context->GetIsolate();
2026-01-18T09:18:16.568009356Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ~~~~~~~~~~~~~~~~~~~^~
2026-01-18T09:18:16.568086028Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: /opt/render/.cache/25.3.0/include/node/v8-context.h:262:12: note: declared here
2026-01-18T09:18:16.56818249Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: 262 | Isolate\* GetIsolate();
2026-01-18T09:18:16.568317793Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: | ^~~~~~~~~~
2026-01-18T09:18:17.902244581Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: SOLINK_MODULE(target) Release/obj.target/sshcrypto.node
2026-01-18T09:18:17.955650582Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: COPY Release/sshcrypto.node
2026-01-18T09:18:17.961152974Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: make: Leaving directory '/opt/render/project/src/node_modules/.pnpm/ssh2@1.17.0/node_modules/ssh2/lib/protocol/crypto/build'
2026-01-18T09:18:17.971484422Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: Succeeded in building optional crypto binding
2026-01-18T09:18:17.974478838Z .../.pnpm/ssh2@1.17.0/node_modules/ssh2 install: Done
2026-01-18T09:18:18.124067135Z
2026-01-18T09:18:18.124091956Z devDependencies: skipped because NODE_ENV is set to production
2026-01-18T09:18:18.124094205Z
2026-01-18T09:18:18.158977657Z Done in 30.6s
2026-01-18T09:18:18.988617917Z
2026-01-18T09:18:18.988636617Z > @unique-brew/backend@1.0.0 build /opt/render/project/src/apps/backend
2026-01-18T09:18:18.988639067Z > tsc
2026-01-18T09:18:18.988640937Z
2026-01-18T09:18:24.685372361Z src/index.ts(4,23): error TS7016: Could not find a declaration file for module 'swagger-ui-express'. '/opt/render/project/src/node_modules/.pnpm/swagger-ui-express@5.0.1_express@5.1.0/node_modules/swagger-ui-express/index.js' implicitly has an 'any' type.
2026-01-18T09:18:24.685398132Z Try `npm i --save-dev @types/swagger-ui-express` if it exists or add a new declaration (.d.ts) file containing `declare module 'swagger-ui-express';`
2026-01-18T09:18:24.757981766Z /opt/render/project/src/apps/backend:
2026-01-18T09:18:24.758003957Z  ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @unique-brew/backend@1.0.0 build: `tsc`
2026-01-18T09:18:24.758009457Z Exit status 2
2026-01-18T09:18:25.192453959Z ==> Build failed 😞
2026-01-18T09:18:25.192474929Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys
