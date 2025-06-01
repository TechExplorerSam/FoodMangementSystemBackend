const analyticsServices = require('../Services/AnalyticsServices');



exports.getAnalytics = async (req, res) => {
    try {
        const analyticsData = await analyticsServices.getAnalytics();
        res.status(200).json({
            message: 'Analytics data fetched successfully',
            data: analyticsData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error while fetching analytics data',
            error: err.message
        });
    }
}
exports.calculateAnalytics = async (req, res) => {
    try {
        const analyticsData = await analyticsServices.calculateAnalytics();
        res.status(200).json({
            message: 'Analytics calculated successfully',
            data: analyticsData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error while calculating analytics',
            error: err.message
        });
    }
}
exports.getAnalyticsById = async (req, res) => {
    try {
        const analyticsId = req.params.id;
        const analyticsData = await analyticsServices.getAnalyticsById(analyticsId);
        if (!analyticsData) {
            return res.status(404).json({
                message: 'Analytics data not found'
            });
        }
        res.status(200).json({
            message: 'Analytics data fetched successfully',
            data: analyticsData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error while fetching analytics data by ID',
            error: err.message
        });
    }
}