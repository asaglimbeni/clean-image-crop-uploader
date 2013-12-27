/*
Copyright (c) 2013, Alfredo Saglimbeni (alfredo.saglimbeni(at)gmail.com)
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
* Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.
* the names of its contributors may be used to endorse or promote products
derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/************************/
/**CICU WIDGET**/
/************************/

(function() {
    var global = this;
    var $ = global.$;
    var console = global.console || {log: function() {}};

    var CicuWidget = global.CicuWidget = function(element, options) {
        if(! $(element).hasClass('has-cicu-widget')){
            this.options = {
                modalButtonLabel : 'Upload image',
                changeButtonText : 'Select a different image',
                sizeAlertMessage : 'Warning: the area selected is too small, min size:',
                sizeErrorMessage : "Image doesn't meet the minimal size requirement",
                modalSaveCropMessage: 'Set image',
                modalCloseCropMessage: 'Close',
                uploadingMessage : 'Uploading your image',
                fileUploadLabel : 'Select image from your computer',
                sizeWarning : 'True',
                ratioWidth :'800',
                ratioHeight :'600',
                onUpload: null,
                onComplete: null,
                onError: null,
                onRemove: null,
                onCrop: null
            };
            $.extend(this.options, options);
            this.$element = $(element);
            $('label[for='+this.$element.attr('id')+']:first').removeAttr('for');
            this.initialize();
            $(element).addClass('has-cicu-widget');
         }
    };

    CicuWidget.prototype.DjangoCicuError = function(message) {
        this.name = 'DjangoCicuError';
        this.message = message;
    };

    CicuWidget.prototype.showMessage = function(message){
        this.$warningSize.html(message+'<a class="close" data-dismiss="alert" href="#">&times;</a>').show();
    };

    CicuWidget.prototype.DjangoCicuError.prototype = new Error();
    CicuWidget.prototype.DjangoCicuError.prototype.constructor = CicuWidget.prototype.DjangoCicuError;

    CicuWidget.prototype.initialize = function() {
        var self = this;
        this.name = this.$element.attr('name');
        this.modalId = this.name + '-uploadModal';
        this.$modalButton = $('<a href="#' + this.modalId +'" role="button" class="btn upload-btn" data-toggle="modal">'+this.options['modalButtonLabel']+'</a>');
        this.$croppedImagePreview = $('<div class="cropped-imag-preview"><img src="'+this.$element.data('filename')+'"/></div>');
        this.$croppedImagePreview.append(this.$modalButton);
        this.$element.after(this.$croppedImagePreview);

        this.$modalWindow = $('<div id="' + this.modalId + '" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
            '<div class="modal-body image-body-modal">' +
            '' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button class="btn" data-dismiss="modal" aria-hidden="true">'+this.options.modalCloseCropMessage+'</button>' +
            '<button class="modal-set-image-button btn btn-primary disabled">'+this.options.modalSaveCropMessage+'</button>' +
            '</div>' +
            '</div>');

        this.$element.after(this.$modalWindow);
        this.$uploadModalBody = this.$modalWindow.children('div.modal-body');
        this.$warningSize = $('<div class="warning-size-message alert alert-error hide"></div>');

        this.$uploadModalBody.before(this.$warningSize);
        // Create a hidden field to contain our uploaded file name
        this.$hiddenElement = $('<input type="hidden"/>')
            .attr('name', this.name)
            .val(this.$element.data('filename'));
        this.$element.attr('name', ''); // because we don't want to conflict with our hidden field
        this.$element.after(this.$hiddenElement);

        // Initialize preview area and action buttons
        this.$previewArea = $('<div class="ajax-upload-preview-area"></div>');
        this.$uploadModalBody.append(this.$previewArea);

        // Listen for when a file is selected, and perform upload
        this.$element.on('change', function() {
            self.upload();
        });
        this.$uploadButton = $('<div class="fileupload fileupload-new" data-provides="fileupload"><span class="btn btn-file">' +
            '<span class="fileupload-label fileupload-new" data-loading-text="Uploading your image...">'+this.options.fileUploadLabel+'</span></span>'+
            '</div>');
        this.$uploadModalBody.append(this.$uploadButton);
        this.$fileUploadLabel = this.$uploadButton.find('.fileupload-label');
        this.$uploadButton.children('.btn-file').append(this.$element);
        this.$modalSetImageButton = this.$modalWindow.find('button.modal-set-image-button');
        this.$modalSetImageButton.on( 'click' , function(){
            if (!$(this).hasClass('disabled')){
                self.setCrop();
            }
            return false;
        });
    };
    CicuWidget.prototype.setCrop = function() {
        var self = this;

        $.ajax(this.$element.data('crop-url'), {
            iframe : true,
            data : {cropping : this.$cropping.val(),
            id : this.$hiddenElement.data('imageId')},
            type: 'POST',
            dataType: 'json',
            success: function(data) { self.cropDone(data); },
            error: function(data) { self.cropFail(data); }
        });

    };

    CicuWidget.prototype.cropDone = function(data) {
        // This handles errors as well because iframe transport does not
        // distinguish between 200 response and other errors
        if(data.errors) {
            if(this.options.onError) {
                this.options.onError.call(this, data);
            } else {
                console.log('Crop failed:');
                console.log(data);
            }
        } else {
            this.$hiddenElement.val(data.id);
            this.$croppedImagePreview.children('img:first').attr('src',data.path);
            this.$modalWindow.modal('hide');
        }
        if(this.options.onCrop) {
            var result = this.options.onUpload.call(this);
            if(result === false)
                return;
        }
    };

    CicuWidget.prototype.cropFail = function(xhr) {
        if(this.options.onError) {
            this.options.onError.call(this);
        } else {
            console.log('Crop failed:');
            console.log(xhr);
            this.showMessage('Crop failed!');
        }
    };

    CicuWidget.prototype.upload = function() {
        var self = this;
        if(!this.$element.val()) return;
        this.$fileUploadLabel.button('loading');
        this.$fileUploadLabel.addClass('disabled');
        if(this.options.onUpload) {
            var result = this.options.onUpload.call(this);
            if(result === false) return;
        }
        this.$element.attr('name', 'file');
        $.ajax(this.$element.data('upload-url'), {
            iframe: true,
            files: this.$element,
            processData: false,
            type: 'POST',
            dataType: 'json',
            success: function(data) { self.uploadDone(data); },
            error: function(data) { self.uploadFail(data); }
        });
    };

    CicuWidget.prototype.uploadDone = function(data) {
        // This handles errors as well because iframe transport does not
        // distinguish between 200 response and other errors
        this.$fileUploadLabel.removeClass('disabled');
        this.$fileUploadLabel.button('reset');
        if(data.errors) {
            if(this.options.onError) {
                this.options.onError.call(this, data);
            } else {
                console.log('Upload failed:');
                console.log(data);
            }
        } else {
            if ((data.width < this.options.ratioWidth || data.height < this.options.ratioHeight) && this.options.sizeWarning == 'True' ){

                this.showMessage(this.options.sizeErrorMessage+this.options.ratioWidth+"x"+this.options.ratioHeight);


                if (this.options.sizeWarning == "True"){
                    this.$fileUploadLabel.text(this.options.fileUploadLabel);
                    this.$hiddenElement.data('imageId','');
                    this.$hiddenElement.data('imagePath','');
                }

            }else{
                this.$orgWidth = data.width;
                this.$orgHeight = data.height;
                this.$hiddenElement.data('imageId',data.id);
                this.$hiddenElement.data('imagePath',data.path);
                this.$fileUploadLabel.text(this.options.changeButtonText);
                this.$modalSetImageButton.removeClass('disabled');
            }
            var tmp = this.$element;
            this.$element = this.$element.clone(true).val('');
            tmp.replaceWith(this.$element);
            this.displaySelection();
            if(this.options.onComplete) this.options.onComplete.call(this, data.path);

        }
    };

    CicuWidget.prototype.uploadFail = function(xhr) {
        if(this.options.onError) {
            this.options.onError.call(this);
        } else {
            console.log('Upload failed:');
            console.log(xhr);
            this.showMessage('Upload failed');
        }
    };

    CicuWidget.prototype.displaySelection = function() {
        var filename = this.$hiddenElement.data('imagePath');

        if(filename !== '') {
            this.$previewArea.empty();
            this.$previewArea.append(this.generateFilePreview(filename));
            image_cropping.init(this);
            this.$cropping = this.$previewArea.find('input[name=cropping]');
            this.$uploadModalBody.removeClass( 'image-body-modal' );
            this.$previewArea.show();

        } else {
            this.$uploadModalBody.addClass( 'image-body-modal' );
            this.$previewArea.slideUp();
            this.$element.show();
        }
    };

    CicuWidget.prototype.generateFilePreview = function(filename) {
        // Returns the html output for displaying the given uploaded filename to the user.
        var output = '', width = this.$orgWidth , height = this.$orgHeight;
        var $self = this;
        $.each(['jpg', 'jpeg', 'png', 'gif'], function(i, ext) {
            if(filename.toLowerCase().slice(-ext.length) == ext) {
                var crop_input = '<input data-size-warning="'+$self.options.sizeWarning+'"  data-width="'+$self.options.ratioWidth+'" data-height="'+$self.options.ratioHeight+'"  data-allow-fullsize="false" name="cropping" maxlength="255" value="300,100,600,600" class="image-ratio" data-image-field="image_field" data-adapt-rotation="false" type="text" data-my-name="cropping" style="display: none;" />';
                output += '<input data-org-width="'+width+'" data-org-height="'+height+'" data-field-name="image_field" class="crop-thumb hide" src="'+filename+'"  data-thumbnail-url="'+filename+'" />' + crop_input;
                return false;
            }
        });
        output += '';
        return output;
    };

    CicuWidget.autoDiscover = function(options) {
        var cicuOptions = $( '#cicu-options');
        options =  cicuOptions.data();
        cicuOptions.remove();
        $('input[type="file"].ajax-upload:not(.has-cicu-widget)').each(function(index, element) {
            new CicuWidget(element, options);
        });
    };
}).call(this);


/******************/
/**IMAGE CROPPING**/
/******************/

var image_cropping = {
    $: $,
    init: function(ajaxUploadWidget) {
        // set styles for size-warning
        this.$ajaxUploadWidget = ajaxUploadWidget;
        var style_img_warning = 'div.jcrop-image.size-warning .jcrop-vline{border:1px solid red; background: none;}' +
            'div.jcrop-image.size-warning .jcrop-hline{border:1px solid red; background: none;}';
        image_cropping.$("<style type='text/css'>" + style_img_warning + "</style>").appendTo('head');

        image_cropping.$('input.image-ratio').each(function() {
            var $this = image_cropping.$(this),
            // find the image field corresponding to this cropping value
            // by stripping the last part of our id and appending the image field name
                field = $this.attr('name').replace($this.data('my-name'), $this.data('image-field')),

            // there should only be one file field we're referencing but in special cases
            // there can be several. Deal with it gracefully.
                $image_input = image_cropping.$('input.crop-thumb[data-field-name=' + field + ']:first');

            // skip this image if it's empty and hide the whole field, within admin and by itself
            if (!$image_input.length || $image_input.data('thumbnail-url') == undefined) {
                $this.hide().parents('div.form-row:first').hide();
                return;
            }
            // check if the image field should be hidden
            if ($image_input.data('hide-field')) {
                $image_input.hide().parents('div.form-row:first').hide();
            }

            var image_id = ajaxUploadWidget.name + '-' + $this.attr('name') + '-image',
                org_width = $image_input.data('org-width'),
                org_height = $image_input.data('org-height'),
                min_width = $this.data('width'),
                min_height = $this.data('height');


            var is_image_portrait = (org_height > org_width);
            var is_select_portrait = (min_height > min_width);

            if ($this.data('adapt-rotation') == true) {
                if (is_image_portrait != is_select_portrait) {
                    // cropping height/width need to be switched, picture is in portrait mode
                    var x = min_width;
                    min_width = min_height;
                    min_height = x;
                }
            }

            var $image = image_cropping.$('<img>', {
                'id': image_id,
                'src': $image_input.data('thumbnail-url')
            });

            var options = {
                aspectRatio: min_width/min_height,
                minSize: ($this.data('sizeWarning') == 'True' ? [min_width, min_height]: [0,0]),
                trueSize: [org_width, org_height],
                onSelect: image_cropping.update_selection($this),
                addClass: ($this.data('sizeWarning') == 'True' && ((org_width < min_width) || (org_height < min_height))) ? 'size-warning jcrop-image': 'jcrop-image',
                allowSelect: false
            };

            var cropping_disabled = false;
            if($this.val()[0] == "-"){
                cropping_disabled = true;
                $this.val($this.val().substr(1));
            }

            // is the image bigger than the minimal cropping values?
            // otherwise lock cropping area on full image
            var initial;
            if ($this.val()) {
                initial = image_cropping.initial_cropping($this.val());
            } else {

                initial = image_cropping.max_cropping(min_width, min_height, org_width, org_height);

                // set cropfield to initial value
                $this.val(initial.join(','));
            }

            image_cropping.$.extend(options, {setSelect: initial});

            // hide the input field, show image to crop instead
            $this.hide().after($image);

            var jcrop = {};

            image_cropping.$('#' + image_id).Jcrop(options, function(){jcrop[image_id]=this;});

            if ($this.data('allow-fullsize') == true) {
                if(cropping_disabled){
                    jcrop[image_id].release();
                    $this.val('-'+$this.val());
                }
                var label = 'allow-fullsize-'+image_id;
                var checked = cropping_disabled ? '' : ' checked="checked"';
                image_cropping.$('<div class="field-box allow-fullsize">' +
                    '<input type="checkbox" id="'+label+'" name="'+label+'"'+checked+'></div>').appendTo($this.parent());
                image_cropping.$('<style type="text/css">div.allow-fullsize{padding: 5px 0 0 10px;}</style>').appendTo('head');
                image_cropping.$('#'+label).click(function(){
                    if (cropping_disabled==true){
                        $this.val($this.val().substr(1));
                        jcrop[image_id].setSelect($this.val().split(','));
                        cropping_disabled = false;
                    } else {
                        $this.val('-'+$this.val());
                        jcrop[image_id].release();
                        cropping_disabled = true;
                    }
                });
                $this.parent().find('.jcrop-tracker').mousedown(function(){
                    if (cropping_disabled){
                        image_cropping.$('#'+label).attr('checked','checked');
                        cropping_disabled = false;
                    }
                });
            }
        });

        if (image_cropping.$('body').hasClass('change-form')) {
            // if we're in the Django admin, the holder needs to be floated
            // so it clears the label
            image_cropping.$("<style type='text/css'>div.jcrop-holder{float:left;}</style>").appendTo('head');
        }
    },
    max_cropping: function(width, height, image_width, image_height) {
        var ratio = width/height;
        var offset;

        if (image_width < image_height * ratio) {
            // width fits fully, height needs to be cropped
            offset = Math.round((image_height-(image_width/ratio))/2);
            return [0, offset, image_width, image_height - offset];
        }
        // height fits fully, width needs to be cropped
        offset = Math.round((image_width-(image_height * ratio))/2);
        return [offset, 0, image_width - offset, image_height];
    },
    initial_cropping: function(val) {
        if (val == '') { return; }
        var s = val.split(',');
        return [parseInt(s[0], 10),parseInt(s[1], 10),parseInt(s[2], 10),parseInt(s[3], 10)];
    },
    _update_selection: function(sel, $crop_field) {
        if ($crop_field.data('sizeWarning')) {
            image_cropping.crop_indication(sel, $crop_field);
        }
        $crop_field.val(new Array(
            sel.x,
            sel.y,
            sel.x2,
            sel.y2
        ).join(','));
    },
    update_selection: function($crop_field) {
        return function(sel) { image_cropping._update_selection(sel, $crop_field); };
    },
    crop_indication: function(sel, $crop_field) {
        // indicate if cropped area gets smaller than the specified minimal cropping
        var $jcrop_holder = $crop_field.siblings('.jcrop-holder');
        var min_width = $crop_field.data("width");
        var min_height = $crop_field.data("height");
        if (((sel.w < min_width) || (sel.h < min_height)) && $crop_field.data('sizeWarning') == 'True') {
            $jcrop_holder.addClass('size-warning');
            this.$ajaxUploadWidget.showMessage(this.$ajaxUploadWidget.options.sizeAlertMessage+this.$ajaxUploadWidget.options.ratioWidth+"x"+this.$ajaxUploadWidget.options.ratioHeight);
            this.$ajaxUploadWidget.$modalSetImageButton.addClass('disabled');
        } else {
            $jcrop_holder.removeClass('size-warning');
            this.$ajaxUploadWidget.$warningSize.hide();
            this.$ajaxUploadWidget.$modalSetImageButton.removeClass('disabled');
        }
    }
};