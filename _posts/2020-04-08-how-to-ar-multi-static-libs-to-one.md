---
layout: default
author: xiaoli
---

# 怎么正确的把多个静态库打包成一个库

最近因为项目的原因,需要将第三方库,打包一个整库,便于使用.
但是在查找了网上一些例子后,发现都不能完全解决问题.

那么我们首先来说说实际的需求

**需求 :**
将opencv通过交叉编译生成的静态库+第三方库,打包为一个库.
其中需要注意的是,各个库之间存在依赖关系.

网上有一种,比较普遍的解决办法,就是把所有库通过 ```ar -x lib.a```,全部解包为 *.o 文件.
然后再通过 ```ar -qcs target.a *.o```这种方法来打包成一个库.

执行到这里都是没问题的,ar可以类比为tar打包的感觉,随便怎么打都没问题.
但是当你用这个库去编写可执行程序的时候,问题来了,链接的时候,报错.各种数据结构和函数找不到.

原因是什么呢,其实和很简单,链接的顺序出了问题.

首先我们需要知道,正确的添加库的顺序,在opencv源代码编译好,并install的目的路径,查看文件```/hisiv200_complier_opencv3.1.0_lib/lib/pkgconfig/opencv.pc```的内容.

可以得知默认使用opencv库的添加顺序是:
```
 libopencv_imgcodecs.a 
 libopencv_shape.a 
 libopencv_stitching.a 
 libopencv_superres.a 
 libopencv_videostab.a 
 libopencv_video.a 
 libopencv_photo.a 
 libopencv_aruco.a 
 libopencv_calib3d.a 
 libopencv_features2d.a 
 libopencv_bioinspired.a
 libopencv_dnn.a 
 libopencv_dpm.a 
 libopencv_face.a 
 libopencv_objdetect.a
 libopencv_ml.a 
 libopencv_fuzzy.a 
 libopencv_reg.a 
 libopencv_imgproc.a 
 libopencv_surface_matching.a 
 libopencv_flann.a 
 libopencv_core.a

 libzlib.a 
 liblibjpeg.a 
 liblibwebp.a 
 liblibpng.a 
 liblibjasper.a 
 liblibprotobuf.a 
```

如果一个个去输入解包在排序再打包,那基本就是可以告别程序员这个职业了.
这里需要写一个脚本来自动完成.

```bash
#!/bin/bash

#global var
AR=arm-hisiv200-linux-ar #cross compiler 
lib_sequence="libopencv_stitching.a libopencv_superres.a libopencv_videostab.a libopencv_photo.a libopencv_aruco.a libopencv_bgsegm.a libopencv_bioinspired.a libopencv_dnn.a libopencv_dpm.a libopencv_fuzzy.a libopencv_line_descriptor.a libopencv_optflow.a libopencv_plot.a libopencv_reg.a libopencv_saliency.a libopencv_stereo.a libopencv_structured_light.a libopencv_rgbd.a libopencv_surface_matching.a libopencv_tracking.a libopencv_datasets.a libopencv_text.a libopencv_face.a libopencv_xfeatures2d.a libopencv_shape.a libopencv_video.a libopencv_ximgproc.a libopencv_calib3d.a libopencv_features2d.a libopencv_flann.a libopencv_xobjdetect.a libopencv_objdetect.a libopencv_highgui.a libopencv_videoio.a libopencv_imgcodecs.a libopencv_ml.a libopencv_imgproc.a libopencv_core.a"
object_file_sq
target_combine_lib="libhisi200_opencv_static_combine.a"

#functions
function ar_static_libs_to_one()
{
    cd $work_dir
    for lib_file in $lib_sequence
    do  
        if [ "${lib_file##*.}"x = "a"x ];then # if is a *.a lib file

            # echo -e "\nvvvvvvvvvvvv AR ${lib_file} to .o file vvvvvvvvvvvv" # test print
            echo -e "\nvvvvvvvvvvvv AR ${lib_file} to .o file vvvvvvvvvvvv" >> print.log # test log

            ${AR} -x ${lib_file}

            object_file_sq+=$(${AR} -t ${lib_file})
            object_file_sq+=" "
            # echo $object_file_sq # test print
            echo -e $object_file_sq >> print.log # test log

        fi
    done
	
	echo -e "\nvvvvvvvvvvvv Build combine lib vvvvvvvvvvvv"
    echo $object_file_sq
	${AR} -qcs $target_combine_lib $object_file_sq
}

#main
work_dir="$1"

echo "rm all .o files"
rm -rf ./*.o

echo "rm ${target_combine_lib}"
rm -rf ./${target_combine_lib}

ar_static_libs_to_one $work_dir

```

使用该脚本
```shell
./ar_multi_static_lib_to_one.sh ./hisiv200_complier_opencv3.1.0_lib/lib
```
就会在所选的lib库目录,进行操作,会在目标路径生成需要的打包库和调试日志.