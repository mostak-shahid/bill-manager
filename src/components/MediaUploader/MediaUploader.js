import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
// import removeMedia from '../../assets/images/removeMedia.svg';
// import uploadMedia from '../../assets/images/uploadMedia.svg';
import {Button} from 'react-bootstrap';


import { FaCloudUploadAlt, FaTimesCircle } from "react-icons/fa";

import './MediaUploader.css';
export default function MediaUploader({ 
    defaultValues, 
    name='', 
    onChange = () => {}, 
    options={} 
}) {   
    // Generate a random fallback name if none is provided
    const [MediaUploaderName] = useState(() => name || `mu-${Math.random().toString(36).substr(2, 9)}`); 
    const [media, setMedia] = useState({});

    useEffect(()=> {
        setMedia(defaultValues)
    },[defaultValues])
    const runUploader = (event) => {
        let frame
        event.preventDefault()

        // If the media frame already exists, reopen it.
        if (frame) {
            frame.open()
            return
        }

        // Create a new media frame
        frame = wp.media({
            title: options?.frame?.title || __("Select or Upload Image", "bill-manager"),
            button: {
                text: options?.buttons?.select || __("Use this image", "bill-manager"),
            },
            multiple: false, // Set to true to allow multiple files to be selected
            library: options?.library || {type: 'image'},
        })
        frame.on("open", function() {
			let selection = frame.state().get('selection');
			let attachment = wp.media.attachment(media?.id);
			selection.add(attachment ? [attachment] : []);
			/*
			let ids = []; // array of IDs of previously selected files. You're gonna build it dynamically
			ids.forEach(function(id) {
			  let attachment = wp.media.attachment(id);
			  selection.add(attachment ? [attachment] : []);
			}); // would be probably a good idea to check if it is indeed a non-empty array
			*/
		});
        frame.on("select", function(){
            var media = frame.state().get("selection").first().toJSON();
            var thumbnail = (media.sizes.thumbnail.url)?media.sizes.thumbnail.url:media.url;
            // console.log(media);
            setMedia(media);
            // setMedia({id:media.id, url:media.url});
            onChange(media);
        });	

        // Finally, open the modal on click
        frame.open()
    }
    const removeImage  = (event) => {
        event.preventDefault();
        setMedia({});
        onChange({});
    }
    return (
        <>
            <div className="bill-manager-media-uploader-unit">
                <div className="media-uploader p-2 bg-white border rounded-2">
                    { media?.url && media?.id ?                     
                        <div className="file-name with-close-button position-relative">
                            <img 
                                className="uploaded-image w-100 img-fluid" 
                                src={media?.sizes?.thumbnail?.url? media.sizes.thumbnail.url:media.url} onClick={runUploader} 
                            />
                            <FaTimesCircle 
                                className="remove-image-icon position-absolute text-danger" 
                                onClick={removeImage} 
                            />
                        </div> : 
                        <div 
                            className="file-name file-name-without-image d-flex align-items-center justify-content-center py-4 border rounded-2" 
                            onClick={runUploader}
                        >
                            <div className="no-media-wrap text-center">
                                <div className="img-wrap">
                                    {/* <img className="uploaded-image" src={uploadMedia} /> */}
                                    <FaCloudUploadAlt className="uploaded-image-icon" />
                                </div>  
                                <div className="text-wrap">
                                    <span className="title">{__("Upload Media", "bill-manager")}</span>
                                    <span className="sub-title">{__("Use the upload button", "bill-manager")} <br/> {__("and select media  ", "bill-manager")}</span>
                                </div> 

                            </div>
                        </div>
                    }
                    <div className="file-detail mt-2">
                        <div className="button-wrapper d-flex gap-2">
                            <Button
                                variant="primary"
                                className='w-100'
                                onClick={runUploader}
                            >
                                {options?.buttons?.upload || __("Upload", "bill-manager")}
                            </Button>   
                            <Button
                                variant="danger"
                                className='w-100'
                                onClick={removeImage}
                            >
                                {options?.buttons?.remove || __("Remove", "bill-manager")}
                            </Button>                            
                        </div>
                    </div>                    
                </div>
                <input type="hidden" value={media?.id??''} name={MediaUploaderName + '[id]'} />
                <input type="hidden" value={media?.url??''} name={MediaUploaderName + '[url]'} />
                {/* {console.log(media)} */}
            </div>
        </>        
    )
}
/*
// Uses
<MediaUploader 
    defaultValues={settingData?.elements?.advanced?.media_uploader} 
    name='elements.advanced.media_uploader' 
    onChange={onChange}
    options = {{
        frame:{
            title: __("Select or Upload Image", "bill-manager"),
        },
        library: {type: 'image'},
        buttons: {
            upload: __("Upload Image", "bill-manager"),
            remove: __("Remove", "bill-manager"),
            select: __("Use this image", "bill-manager")                                            
        }
    }}
/>
*/