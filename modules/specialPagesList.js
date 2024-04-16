const specialPagesList = `
Special:BrokenRedirects
Special:DeadendPages
Special:AncientPages
Special:DoubleRedirects
Special:LintErrors
Special:LongPages
Special:LonelyPages
Special:UnconnectedPages
Special:FewestRevisions
Special:WithoutInterwiki
Special:ProtectedPages
Special:ProtectedTitles
Special:ShortPages
Special:UncategorizedCategories
Special:UncategorizedFiles
Special:UncategorizedPages
Special:UncategorizedTemplates
Special:UnusedCategories
Special:UnusedFiles
Special:UnusedTemplates
Special:WantedCategories
Special:WantedFiles
Special:WantedPages
Special:WantedTemplates
Special:AllPages
Special:PrefixIndex
Special:Categories
Special:CategoryTree
Special:DisambiguationPages
Special:EntityUsage
Special:LinkSearch
Special:DisambiguationPageLinks
Special:PagesWithProp
Special:PagesWithBadges
Special:ListRedirects
Special:Search
Special:TrackingCategories
Special:BotPasswords
Special:ChangeCredentials
Special:ChangeEmail
Special:GlobalPreferences
Special:GlobalRenameRequest
Special:MergeAccount
Special:Manage Two-factor authentication
Special:OAuthManageMyGrants
Special:Notifications
Special:Preferences
Special:RemoveCredentials
Special:PasswordReset
Special:ResetTokens
Special:TopicSubscriptions
Special:ActiveUsers
Special:AutoblockList
Special:BlockList
Special:CreateAccount
Special:EmailUser
Special:CentralAuth
Special:GlobalUsers
Special:GlobalGroupPermissions
Special:ListGrants
Special:OAuthListConsumers
Special:GlobalBlockList
Special:GlobalUserRights
Special:PasswordPolicies
Special:Contributions
Special:ListGroupRights
Special:UserRights
Special:ListUsers
Special:EditRecovery
Special:AbuseLog
Special:NewFiles
Special:NewPages
Special:NewPagesFeed
Special:RecentChanges
Special:RecentChangesLinked
Special:Log
Special:Tags
Special:ListFiles
Special:GlobalUsage
Special:ListDuplicatedFiles
Special:MIMESearch
Special:MediaStatistics
Special:OrphanedTimedText
Special:FileDuplicateSearch
Special:Transcode statistics
Special:Upload
Special:VipsTest
Special:ApiFeatureUsage
Special:ApiSandbox
Special:BookSources
Special:AbuseFilter
Special:ExpandTemplates
Special:GadgetUsage
Special:Gadgets
Special:Statistics
Special:AllMessages
Special:TemplateSandbox
Special:Hieroglyphs
Special:Version
Special:Interwiki
Special:WikiSets
Special:SiteMatrix
Special:DeletePage
Special:Diff
Special:EditPage
Special:NewSection
Special:PageHistory
Special:PageInfo
Special:PermanentLink
Special:ProtectPage
Special:Purge
Special:Random
Special:RandomInCategory
Special:RandomRedirect
Special:RandomRootpage
Special:Redirect
Special:MostLinkedCategories
Special:MostLinkedFiles
Special:MostLinkedPages
Special:MostTranscludedPages
Special:MostCategories
Special:MostInterwikis
Special:MostRevisions
Special:Book
Special:ChangeContentModel
Special:CiteThisPage
Special:ComparePages
Special:Export
Special:PageAssessments
Special:QrCode
Special:UrlShortener
Special:WhatLinksHere
Special:BlockedExternalDomains
Special:EditGrowthConfig
Special:Impact
Special:ManageMentors
Special:MentorDashboard
Special:NewcomerTasksInfo
Special:ValidationStatistics
Special:StablePages
Special:PendingChanges
Special:ContentTranslationStats
Special:Contribute
Special:CreateMassMessageList
Special:DiscussionToolsDebug
Special:FindComment
Special:GlobalRenameProgress
Special:MathWikibase
Special:MathStatus
Special:ORESModels
Special:SecurePoll
Special:ContentTranslation
`;

// Split the list by newlines and filter out empty lines
const specialPagesArray = specialPagesList.trim().split( '\n' ).filter( Boolean );

// Map each special page to an object containing url, title, and an empty query
const specialPagesObject = specialPagesArray.map( page => ( {
    url: `https://en.wikipedia.org/wiki/${page}`,
    title: page,
    query: ''
} ) );


module.exports = specialPagesObject;
