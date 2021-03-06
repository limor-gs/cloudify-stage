/**
 * Created by jakubniezgoda on 11/01/2017.
 */

import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

/**
 * Defines content of expandable row in data table. See {@link TableRowExpandable}
 *
 * ## Access
 * `Stage.Basic.DataTable.DataExpandable`
 */
export default class TableDataExpandable extends Component {

    /**
     * @property {object[]} children - expandable row content
     * @property {string} [className] - name of the style class to be added
     * @property {number} [numberOfColumns=0] - number of columns to be spanned
     */
    static propTypes = {
        children: PropTypes.any.isRequired,
        className: PropTypes.string,
        numberOfColumns: PropTypes.number
    };

    static defaultProps = {
        numberOfColumns: 0
    };

    render() {
        return (
            <tr className="active">
                <td className={this.props.className} colSpan={this.props.numberOfColumns}>
                    <TransitionGroup>
                        <CSSTransition
                            classNames="dataExpandable"
                            appear={true}
                            enter={true}
                            timeout={{ enter: 500, exit: 500}}
                            exit={false}>
                            {this.props.children}
                        </CSSTransition>
                    </TransitionGroup>
                </td>
            </tr>
        );
    }
}
 