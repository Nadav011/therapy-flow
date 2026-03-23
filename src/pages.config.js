/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIBot from './pages/AIBot';
import AIMarketingCenter from './pages/AIMarketingCenter';
import AIMarketingHub from './pages/AIMarketingHub';
import AccountingCenter from './pages/AccountingCenter';
import AcupunctureDiagnosis from './pages/AcupunctureDiagnosis';
import AdminContentTemplates from './pages/AdminContentTemplates';
import AdminMarketingPartners from './pages/AdminMarketingPartners';
import AdminResourceLibrary from './pages/AdminResourceLibrary';
import AdminShop from './pages/AdminShop';
import Analytics from './pages/Analytics';
import Appointments from './pages/Appointments';
import Assessments from './pages/Assessments';
import AutomatedCampaigns from './pages/AutomatedCampaigns';
import Boards from './pages/Boards';
import BusinessSettings from './pages/BusinessSettings';
import CRMMarketing from './pages/CRMMarketing';
import CRMPipeline from './pages/CRMPipeline';
import CampaignCenter from './pages/CampaignCenter';
import CasualClientPage from './pages/CasualClientPage';
import CheckoutPage from './pages/CheckoutPage';
import ClinicAmbiance from './pages/ClinicAmbiance';
import ClinicalCenter from './pages/ClinicalCenter';
import Community from './pages/Community';
import ContentManager from './pages/ContentManager';
import CreditCardPayment from './pages/CreditCardPayment';
import CustomerClub from './pages/CustomerClub';
import DailySchedule from './pages/DailySchedule';
import Dashboard from './pages/Dashboard';
import DashboardSettings from './pages/DashboardSettings';
import DiagnosisSelector from './pages/DiagnosisSelector';
import DiagnosticForms from './pages/DiagnosticForms';
import Exercises from './pages/Exercises';
import FavoritesManagement from './pages/FavoritesManagement';
import FindExpert from './pages/FindExpert';
import FormsCenter from './pages/FormsCenter';
import GoogleMarketing from './pages/GoogleMarketing';
import GroupSessionManager from './pages/GroupSessionManager';
import Guidelines from './pages/Guidelines';
import HealthDeclarations from './pages/HealthDeclarations';
import Home from './pages/Home';
import InitialDiagnosis from './pages/InitialDiagnosis';
import Inventory from './pages/Inventory';
import LandingPageView from './pages/LandingPageView';
import LandingPages from './pages/LandingPages';
import Login from './pages/Login';
import ManageProfessions from './pages/ManageProfessions';
import ManageSubscriptions from './pages/ManageSubscriptions';
import MarketingCenter from './pages/MarketingCenter';
import MiniSite from './pages/MiniSite';
import MiniSiteBuilder from './pages/MiniSiteBuilder';
import NewsletterCenter from './pages/NewsletterCenter';
import Notifications from './pages/Notifications';
import PackagesManagement from './pages/PackagesManagement';
import PageNotFound from './pages/PageNotFound';
import PatientDashboard from './pages/PatientDashboard';
import PatientProfile from './pages/PatientProfile';
import PatientUserPortal from './pages/PatientUserPortal';
import Patients from './pages/Patients';
import PayPlusDashboard from './pages/PayPlusDashboard';
import Payments from './pages/Payments';
import PriceList from './pages/PriceList';
import ProductsManagement from './pages/ProductsManagement';
import ProfessionSetup from './pages/ProfessionSetup';
import Progress from './pages/Progress';
import Promotions from './pages/Promotions';
import Recipes from './pages/Recipes';
import RetentionCampaigns from './pages/RetentionCampaigns';
import RewardsStore from './pages/RewardsStore';
import Shop from './pages/Shop';
import SocialMediaMarketing from './pages/SocialMediaMarketing';
import TaxApprovedJournal from './pages/TaxApprovedJournal';
import TherapistDashboard from './pages/TherapistDashboard';
import TherapistEmployeeDashboard from './pages/TherapistEmployeeDashboard';
import TherapistLandingPage from './pages/TherapistLandingPage';
import TherapistMiniSiteManager from './pages/TherapistMiniSiteManager';
import TherapistPortal from './pages/TherapistPortal';
import TherapistPublicProfile from './pages/TherapistPublicProfile';
import TherapistRegistration from './pages/TherapistRegistration';
import Therapists from './pages/Therapists';
import TreatmentPlans from './pages/TreatmentPlans';
import TreatmentProtocols from './pages/TreatmentProtocols';
import WeeklyCampaigns from './pages/WeeklyCampaigns';
import WeeklySchedule from './pages/WeeklySchedule';
import WellnessHub from './pages/WellnessHub';
import WellnessLanding from './pages/WellnessLanding';
import WellnessManagement from './pages/WellnessManagement';
import WhatsAppCampaigns from './pages/WhatsAppCampaigns';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIBot": AIBot,
    "AIMarketingCenter": AIMarketingCenter,
    "AIMarketingHub": AIMarketingHub,
    "AccountingCenter": AccountingCenter,
    "AcupunctureDiagnosis": AcupunctureDiagnosis,
    "AdminContentTemplates": AdminContentTemplates,
    "AdminMarketingPartners": AdminMarketingPartners,
    "AdminResourceLibrary": AdminResourceLibrary,
    "AdminShop": AdminShop,
    "Analytics": Analytics,
    "Appointments": Appointments,
    "Assessments": Assessments,
    "AutomatedCampaigns": AutomatedCampaigns,
    "Boards": Boards,
    "BusinessSettings": BusinessSettings,
    "CRMMarketing": CRMMarketing,
    "CRMPipeline": CRMPipeline,
    "CampaignCenter": CampaignCenter,
    "CasualClientPage": CasualClientPage,
    "CheckoutPage": CheckoutPage,
    "ClinicAmbiance": ClinicAmbiance,
    "ClinicalCenter": ClinicalCenter,
    "Community": Community,
    "ContentManager": ContentManager,
    "CreditCardPayment": CreditCardPayment,
    "CustomerClub": CustomerClub,
    "DailySchedule": DailySchedule,
    "Dashboard": Dashboard,
    "DashboardSettings": DashboardSettings,
    "DiagnosisSelector": DiagnosisSelector,
    "DiagnosticForms": DiagnosticForms,
    "Exercises": Exercises,
    "FavoritesManagement": FavoritesManagement,
    "FindExpert": FindExpert,
    "FormsCenter": FormsCenter,
    "GoogleMarketing": GoogleMarketing,
    "GroupSessionManager": GroupSessionManager,
    "Guidelines": Guidelines,
    "HealthDeclarations": HealthDeclarations,
    "Home": Home,
    "InitialDiagnosis": InitialDiagnosis,
    "Inventory": Inventory,
    "LandingPageView": LandingPageView,
    "LandingPages": LandingPages,
    "Login": Login,
    "ManageProfessions": ManageProfessions,
    "ManageSubscriptions": ManageSubscriptions,
    "MarketingCenter": MarketingCenter,
    "MiniSite": MiniSite,
    "MiniSiteBuilder": MiniSiteBuilder,
    "NewsletterCenter": NewsletterCenter,
    "Notifications": Notifications,
    "PackagesManagement": PackagesManagement,
    "PageNotFound": PageNotFound,
    "PatientDashboard": PatientDashboard,
    "PatientProfile": PatientProfile,
    "PatientUserPortal": PatientUserPortal,
    "Patients": Patients,
    "PayPlusDashboard": PayPlusDashboard,
    "Payments": Payments,
    "PriceList": PriceList,
    "ProductsManagement": ProductsManagement,
    "ProfessionSetup": ProfessionSetup,
    "Progress": Progress,
    "Promotions": Promotions,
    "Recipes": Recipes,
    "RetentionCampaigns": RetentionCampaigns,
    "RewardsStore": RewardsStore,
    "Shop": Shop,
    "SocialMediaMarketing": SocialMediaMarketing,
    "TaxApprovedJournal": TaxApprovedJournal,
    "TherapistDashboard": TherapistDashboard,
    "TherapistEmployeeDashboard": TherapistEmployeeDashboard,
    "TherapistLandingPage": TherapistLandingPage,
    "TherapistMiniSiteManager": TherapistMiniSiteManager,
    "TherapistPortal": TherapistPortal,
    "TherapistPublicProfile": TherapistPublicProfile,
    "TherapistRegistration": TherapistRegistration,
    "Therapists": Therapists,
    "TreatmentPlans": TreatmentPlans,
    "TreatmentProtocols": TreatmentProtocols,
    "WeeklyCampaigns": WeeklyCampaigns,
    "WeeklySchedule": WeeklySchedule,
    "WellnessHub": WellnessHub,
    "WellnessLanding": WellnessLanding,
    "WellnessManagement": WellnessManagement,
    "WhatsAppCampaigns": WhatsAppCampaigns,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};