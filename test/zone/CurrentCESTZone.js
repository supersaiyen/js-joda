/*
 * @copyright (c) 2016, Philipp Thuerwaechter & Pattrick Hueper
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

import {LocalDate} from '../../src/LocalDate';
import {DayOfWeek} from '../../src/DayOfWeek';
import {Month} from '../../src/Month';
import {ZoneId} from '../../src/ZoneId';
import {ZoneOffset} from '../../src/ZoneOffset';
import {TemporalAdjusters} from '../../src/temporal/TemporalAdjusters';
import {ZoneRules} from '../../src/zone/ZoneRules';

export class CurrentCESTZone extends ZoneId {

    constructor(){
        super();
        this._rules = new CurrentCESTZoneRules();
    }

    rules(){
        return this._rules;
    }

    equals(other){
        if(this === other){
            return true;
        }
        return false;
    }

    toString(){
        return 'CurrentCESTZone';
    }
}

const WINTER_OFFSET = ZoneOffset.ofHours(1);
const SUMMER_OFFSET = ZoneOffset.ofHours(2);

class CurrentCESTZoneRules extends ZoneRules {

    isFixedOffset(){
        return false;
    }

    /**
     *
     * @param {Instant} instant
     * @returns {ZoneOffset}
     */
    offsetOfInstant(instant){
        var year = yearOfInstant(instant);
        var winterSummerTransition = lastSundayOfMarchAtMidnight(year).withHour(1).toInstant(ZoneOffset.UTC);
        var summerWinterTransition = lastSundayOfOctoberAtMidnight(year).withHour(1).toInstant(ZoneOffset.UTC);

        if (instant.isBefore(winterSummerTransition) || ! instant.isBefore(summerWinterTransition)){
            return WINTER_OFFSET;
        } else {
            return SUMMER_OFFSET;
        }
    }

    /**
     *
     * @param {LocalDateTime} localDateTime
     * @returns {ZoneOffset}
     */
    offsetOfLocalDateTime(localDateTime){
        var year = localDateTime.year();
        var winterSummerTransition = lastSundayOfMarchAtMidnight(year).withHour(2);
        var summerWinterTransition = lastSundayOfOctoberAtMidnight(year).withHour(2);
        if (localDateTime.isBefore(winterSummerTransition) || localDateTime.isAfter(summerWinterTransition.withHour(3))){
            return WINTER_OFFSET;
        } else if (localDateTime.isAfter(winterSummerTransition.withHour(3)) && localDateTime.isBefore(summerWinterTransition)){
            return SUMMER_OFFSET;
        } else if (! localDateTime.isBefore(winterSummerTransition) && ! localDateTime.isAfter(winterSummerTransition.withHour(3))){
            // gap! best fit is SUMMER_OFFSET
            return SUMMER_OFFSET;
        } else {
            // overlap! best fit is WINTER_OFFSET
            return WINTER_OFFSET;
        }
    }

    /**
     *
     * @param {LocalDateTime} dateTime
     * @param {ZoneOffset} offset
     * @return {boolean}
     */
    isValidOffset(dateTime, offset) {
        return this.offsetOfLocalDateTime(dateTime).equals(offset);
    }

    //-----------------------------------------------------------------------
    /**
     *
     * @param other
     * @returns {boolean}
     */
    equals(other) {
        if (this === other || other instanceof CurrentCESTZoneRules) {
            return true;
        } else {
            return false;
        }
    }

    /**
     *
     * @returns {string}
     */
    toString() {
        return 'CurrentCESTZoneRules()';
    }

}

function yearOfInstant(instant){
    return LocalDate.ofInstant(instant, ZoneOffset.UTC).year();
}

function lastSundayOfMarchAtMidnight(year){
    return lastSundayOfMonthAtMidnight(year, Month.MARCH);
}

function lastSundayOfOctoberAtMidnight(year){
    return lastSundayOfMonthAtMidnight(year, Month.OCTOBER);
}

function lastSundayOfMonthAtMidnight(year, month){
    return LocalDate
        .of(year, 1, 1)
        .withMonth(month)
        .with(TemporalAdjusters.lastInMonth(DayOfWeek.SUNDAY))
        .atStartOfDay();
}

