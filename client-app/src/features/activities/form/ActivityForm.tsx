import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Header, Segment } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Activity } from "../../../app/models/activity";
import { useStore } from "../../../app/stores/Store";
import { v4 as uuid } from "uuid";
import { Formik, Form } from "formik";
import * as Yup from 'yup'
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { categotyOptions } from "../../../app/common/options/categoryOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";


export default observer(function ActivityForm() {

    const { activityStore } = useStore();
    const { createActivity, updateActivity, loading, loadActivity, loadingInitial } = activityStore;
    const { id } = useParams();
    const navigate = useNavigate();


    const [activity, setActivity] = useState<Activity>({
        id: "",
        title: "",
        description: "",
        category: "",
        date: null,
        city: "",
        venue: ""
    });

    const validationSchema = Yup.object({
        title: Yup.string().required('The activity title is requied'),
        description: Yup.string().required('The activity description is requied'),
        category: Yup.string().required(),
        date: Yup.string().required('Date is required'),
        city: Yup.string().required(),
        venue: Yup.string().required(),
    })

    useEffect(() => {
        if (id) loadActivity(id).then(activity => { setActivity(activity!) })
    }, [id, loadActivity]);

    function handleFormSubmit(activity: Activity) {

        if (!activity.id) {
            activity.id = uuid();
            createActivity(activity).then(() => navigate(`/activities/${activity.id}`))
        } else {
            updateActivity(activity).then(() => navigate(`/activities/${activity.id}`))
        }
    }

    //function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    //    const { name, value } = event.target;
    //    setActivity({ ...activity, [name]: value });

    //}

    if (loadingInitial) return <LoadingComponent content="Loading activity..." />

    return (
        <Segment clearing>
            <Header content='Activity Details' sub color='teal' />
            <Formik
                enableReinitialize
                initialValues={activity}
                onSubmit={values => handleFormSubmit(values)}
                validationSchema={validationSchema}
            >
                {({ handleSubmit, isValid, isSubmitting, dirty }) => (
                    <Form className='ui form' onSubmit={handleSubmit} autoComplete="off">
                        <MyTextInput placeholder="Title" name="title" />
                        <MyTextArea rows={3} placeholder="Description" name="description" />
                        <MySelectInput options={categotyOptions} placeholder="Category" name="category" />
                        <MyDateInput
                            placeholderText="Date"
                            name="date"
                            showTimeSelect
                            timeCaption='time'
                            dateFormat='MMMM d, yyyy h:m aa'
                        />
                        <Header content='Location Details' sub color='teal' />
                        <MyTextInput placeholder="City" name="city" />
                        <MyTextInput placeholder="Venue" name="venue" />
                        <Button
                            disabled={isSubmitting || !dirty || !isValid}
                            loading={loading} floated="right"
                            positive type="submit" content="Submit" />
                        <Button as={Link} to="/activities" floated="right" type="button" content="Cancel" />
                    </Form>
                )}
            </Formik>
        </Segment>
    )
})