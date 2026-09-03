"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingTransactionType = exports.ListingMarketStatus = exports.ListingSystemStatus = exports.CourseStatus = exports.EventType = exports.EventStatus = exports.SectionType = exports.PolicyType = exports.SocialChannel = exports.UserStatus = exports.ROLE = void 0;
require("next-auth");
//################################################################################
//## ENUMS FROM PRISMA SCHEMA
//################################################################################
var ROLE;
(function (ROLE) {
    ROLE[ROLE["USER"] = 0] = "USER";
    ROLE[ROLE["CONSUMER"] = 1] = "CONSUMER";
    ROLE[ROLE["AGENT"] = 2] = "AGENT";
    ROLE[ROLE["CLIENT"] = 3] = "CLIENT";
    ROLE[ROLE["ADMIN"] = 4] = "ADMIN";
    ROLE[ROLE["STUDENT"] = 5] = "STUDENT";
    ROLE[ROLE["EDUCATOR"] = 6] = "EDUCATOR";
    ROLE[ROLE["HEADTEACHER"] = 7] = "HEADTEACHER";
    ROLE[ROLE["PARENT"] = 8] = "PARENT";
    ROLE[ROLE["JUNIOR"] = 9] = "JUNIOR";
    ROLE[ROLE["SENIOR"] = 10] = "SENIOR";
    ROLE[ROLE["SOPHOMORE"] = 11] = "SOPHOMORE";
    ROLE[ROLE["FRESHMAN"] = 12] = "FRESHMAN";
    ROLE[ROLE["WRITER"] = 13] = "WRITER";
    ROLE[ROLE["STAFF"] = 14] = "STAFF";
    ROLE[ROLE["MODERATOR"] = 15] = "MODERATOR";
    ROLE[ROLE["PATIENT"] = 16] = "PATIENT";
    ROLE[ROLE["DOCTOR"] = 17] = "DOCTOR";
    ROLE[ROLE["PATRON"] = 18] = "PATRON";
    ROLE[ROLE["EXPERT"] = 19] = "EXPERT";
    ROLE[ROLE["STAFF_MEMBER"] = 20] = "STAFF_MEMBER";
    ROLE[ROLE["SERVICE_PROVIDER"] = 21] = "SERVICE_PROVIDER";
})(ROLE = exports.ROLE || (exports.ROLE = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus[UserStatus["ACTIVE"] = 0] = "ACTIVE";
    UserStatus[UserStatus["INACTIVE"] = 1] = "INACTIVE";
    UserStatus[UserStatus["SUSPENDED"] = 2] = "SUSPENDED";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));
var SocialChannel;
(function (SocialChannel) {
    SocialChannel["FACEBOOK"] = "FACEBOOK";
    SocialChannel["TWITTER"] = "TWITTER";
    SocialChannel["INSTAGRAM"] = "INSTAGRAM";
    SocialChannel["LINKEDIN"] = "LINKEDIN";
    SocialChannel["YOUTUBE"] = "YOUTUBE";
    SocialChannel["TIKTOK"] = "TIKTOK";
})(SocialChannel = exports.SocialChannel || (exports.SocialChannel = {}));
var PolicyType;
(function (PolicyType) {
    PolicyType["SHIPPING"] = "SHIPPING";
    PolicyType["RETURNS"] = "RETURNS";
    PolicyType["PRIVACY"] = "PRIVACY";
    PolicyType["TERMS"] = "TERMS";
    PolicyType["CANCELLATION"] = "CANCELLATION";
    PolicyType["CONFIDENTIALITY"] = "CONFIDENTIALITY";
})(PolicyType = exports.PolicyType || (exports.PolicyType = {}));
var SectionType;
(function (SectionType) {
    SectionType[SectionType["Hero"] = 0] = "Hero";
    SectionType[SectionType["FeatureGrid"] = 1] = "FeatureGrid";
    SectionType[SectionType["TestimonialCarousel"] = 2] = "TestimonialCarousel";
    SectionType[SectionType["BlogPreview"] = 3] = "BlogPreview";
    SectionType[SectionType["CustomHtml"] = 4] = "CustomHtml";
    SectionType[SectionType["About"] = 5] = "About";
    SectionType[SectionType["Services"] = 6] = "Services";
    SectionType[SectionType["Awards"] = 7] = "Awards";
    SectionType[SectionType["HealthTips"] = 8] = "HealthTips";
    SectionType[SectionType["Features"] = 9] = "Features";
    SectionType[SectionType["HowItWorks"] = 10] = "HowItWorks";
    SectionType[SectionType["Pricing"] = 11] = "Pricing";
    SectionType[SectionType["CTA"] = 12] = "CTA";
    SectionType[SectionType["Metrics"] = 13] = "Metrics";
    SectionType[SectionType["Stats"] = 14] = "Stats";
})(SectionType = exports.SectionType || (exports.SectionType = {}));
var EventStatus;
(function (EventStatus) {
    EventStatus[EventStatus["SCHEDULED"] = 0] = "SCHEDULED";
    EventStatus[EventStatus["POSTPONED"] = 1] = "POSTPONED";
    EventStatus[EventStatus["CANCELLED"] = 2] = "CANCELLED";
    EventStatus[EventStatus["COMPLETED"] = 3] = "COMPLETED";
})(EventStatus = exports.EventStatus || (exports.EventStatus = {}));
var EventType;
(function (EventType) {
    EventType[EventType["GENERAL"] = 0] = "GENERAL";
    EventType[EventType["ACADEMIC"] = 1] = "ACADEMIC";
    EventType[EventType["SPORTS"] = 2] = "SPORTS";
    EventType[EventType["CULTURAL"] = 3] = "CULTURAL";
    EventType[EventType["MEETING"] = 4] = "MEETING";
    EventType[EventType["WORKSHOP"] = 5] = "WORKSHOP";
    EventType[EventType["ORIENTATION"] = 6] = "ORIENTATION";
    EventType[EventType["FUNDRAISER"] = 7] = "FUNDRAISER";
    EventType[EventType["OTHER"] = 8] = "OTHER";
})(EventType = exports.EventType || (exports.EventType = {}));
var CourseStatus;
(function (CourseStatus) {
    CourseStatus[CourseStatus["DRAFT"] = 0] = "DRAFT";
    CourseStatus[CourseStatus["PUBLISHED"] = 1] = "PUBLISHED";
    CourseStatus[CourseStatus["ARCHIVED"] = 2] = "ARCHIVED";
    CourseStatus[CourseStatus["INACTIVE"] = 3] = "INACTIVE";
    CourseStatus[CourseStatus["ACTIVE"] = 4] = "ACTIVE";
})(CourseStatus = exports.CourseStatus || (exports.CourseStatus = {}));
// 1. System state: Tracks the workflow and moderation lifecycle
var ListingSystemStatus;
(function (ListingSystemStatus) {
    ListingSystemStatus["DRAFT"] = "DRAFT";
    ListingSystemStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ListingSystemStatus["ACTIVE"] = "ACTIVE";
    ListingSystemStatus["REJECTED"] = "REJECTED";
    ListingSystemStatus["INACTIVE"] = "INACTIVE";
})(ListingSystemStatus = exports.ListingSystemStatus || (exports.ListingSystemStatus = {}));
// 2. Market state: Tracks transactional availability for consumers
var ListingMarketStatus;
(function (ListingMarketStatus) {
    ListingMarketStatus["AVAILABLE"] = "AVAILABLE";
    ListingMarketStatus["UNDER_OFFER"] = "UNDER_OFFER";
    ListingMarketStatus["SOLD"] = "SOLD";
    ListingMarketStatus["RENTED"] = "RENTED";
})(ListingMarketStatus = exports.ListingMarketStatus || (exports.ListingMarketStatus = {}));
var ListingTransactionType;
(function (ListingTransactionType) {
    ListingTransactionType["SALE"] = "SALE";
    ListingTransactionType["RENT"] = "RENT";
})(ListingTransactionType = exports.ListingTransactionType || (exports.ListingTransactionType = {}));
