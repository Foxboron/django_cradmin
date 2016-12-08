import React from "react";
import CradminSearch from "./CradminSearch";
import CradminSearchResultList from "./CradminSearchResultList";
import CradminModal from "./CradminModal";


export default class CradminSelectModal extends CradminModal {
  renderModalContent() {
    const searchProps = Object.assign({}, this.props.searchComponentProps, {
      searchRequestedSignalName: this.props.searchRequestedSignalName,
      autofocus: true
    });

    const resultListProps = Object.assign({}, this.props.resultListComponentProps, {
      selectResultSignalName: this.props.selectResultSignalName,
      searchCompletedSignalName: this.props.searchCompletedSignalName,
      valueAttribute: this.props.valueAttribute,
      resultComponentProps: this.props.resultComponentProps,
      selectedValue: this.props.selectedValue
    });

    return <div>
        <CradminSearch {...searchProps} />
        <CradminSearchResultList {...resultListProps} />
      </div>;
  }
}