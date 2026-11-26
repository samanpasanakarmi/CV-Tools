import { safePhoto } from './model.js';
// Validate, crop and resize a profile photo in the browser.
export async function preparePhoto(file){
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Choose a PNG, JPEG or WebP photo.');
  if(file.size>4000000)throw new Error('Image exceeds 4 MB. Choose a smaller picture.');
  const url=URL.createObjectURL(file);
  try{
    const image=new Image();image.decoding='async';image.src=url;
    await image.decode();
    if(image.width<1||image.height<1)throw new Error('Unable to read this photo.');
    const canvas=document.createElement('canvas');canvas.width=360;canvas.height=360;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Photo editing is not available in this browser.');
    const side=Math.min(image.width,image.height);
    ctx.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,360,360);
    const data=canvas.toDataURL('image/jpeg',0.75);
    if(!safePhoto(data))throw new Error('Photo is too large after processing.');
    return data;
  } finally{URL.revokeObjectURL(url);}
}
