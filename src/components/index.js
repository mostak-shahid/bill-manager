import { __ } from "@wordpress/i18n";
import { Illustration404 } from '../lib/Illustrations';
import HorizontalMenuControl from './HorizontalMenuControl/HorizontalMenuControl';

import BreadcrumbControl from "./BreadcrumbControl/BreadcrumbControl";
import ColorPickerControl from "./ColorPickerControl/ColorPickerControl";
import ImageSelector from "./ImageSelector/ImageSelector";
import MediaUploader from "./MediaUploader/MediaUploader";
import MultiSelect from "./MultiSelect/MultiSelect";
import PageInfo from './PageInfo/PageInfo';
import RepeatableField from "./RepeatableField/RepeatableField";
import SortableAccordion from "./SortableAccordion/SortableAccordion";
import ToastControl from "./ToastControl/ToastControl";

const NotFound = () => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
        <Illustration404 style={{ width: 250, height: 250, display: 'inline-block' }} />
        <h3>{__("404 - Page Not Found", "bill-manager")}</h3>
    </div>
);

export {
    BreadcrumbControl,
    ColorPickerControl,
    ImageSelector,
    MediaUploader,
    MultiSelect,
    PageInfo,
    RepeatableField,
    SortableAccordion,
    ToastControl,

    HorizontalMenuControl,
    NotFound,
};