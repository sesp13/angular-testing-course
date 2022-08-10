import { TestBed } from "@angular/core/testing";
import { CoursesService } from "./courses.service";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { Course } from "../model/course";
import { COURSES, findLessonsForCourse } from "../../../../server/db-data";
import * as _ from "cypress/types/lodash";
import { HttpErrorResponse } from "@angular/common/http";
import { Lesson } from "../model/lesson";

describe("Courses Service", () => {
  let coursesService: CoursesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CoursesService],
    });

    coursesService = TestBed.inject(CoursesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it("should retreive all courses", () => {
    coursesService.findAllCourses().subscribe((courses: Course[]) => {
      expect(courses).toBeTruthy("No courses returned");
      expect(courses.length).toBe(12, "Incorrect number of courses");
      const course = courses.find((course) => course.id == 12);
      expect(course.titles.description).toBe("Angular Testing Course");
    });

    // Mock request
    // The url comes from the class method which is using this endpoint to work
    const req = httpTestingController.expectOne("/api/courses");
    expect(req.request.method).toEqual("GET");
    // Send custom data as response to the subscriber
    req.flush({ payload: Object.values(COURSES) });
  });

  it("should find a course by id", () => {
    coursesService.findCourseById(12).subscribe((course: Course) => {
      expect(course).toBeTruthy();
      expect(course.id).toBe(12);
    });
    const req = httpTestingController.expectOne("/api/courses/12");
    expect(req.request.method).toEqual("GET");
    req.flush(COURSES[12]);
  });

  it("should save the course data", () => {
    const changes: Partial<Course> = {
      titles: { description: "Testing Course" },
    };
    coursesService.saveCourse(12, changes).subscribe((course: Course) => {
      expect(course.id).toBe(12);
    });

    const req = httpTestingController.expectOne("/api/courses/12");
    expect(req.request.method).toEqual("PUT");
    expect(req.request.body.titles.description).toEqual(
      changes.titles.description
    );
    req.flush({
      ...COURSES[12],
      ...changes,
    });
  });

  it("should give an error if save course fails", () => {
    const changes: Partial<Course> = {
      titles: { description: "Testing Course" },
    };
    coursesService.saveCourse(12, changes).subscribe({
      next: () => {
        fail("The save course operation should have failed");
      },
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpTestingController.expectOne("/api/courses/12");
    expect(req.request.method).toEqual("PUT");
    req.flush("Save course failed", {
      status: 500,
      statusText: "Internal Server Error",
    });
  });

  it("should find a list of lessons", () => {
    coursesService.findLessons(12).subscribe((lessons: Lesson[]) => {
      expect(lessons).toBeTruthy();
      expect(lessons.length).toBe(3);
    });

    const req = httpTestingController.expectOne(
      (req) => req.url == "/api/lessons"
    );
    expect(req.request.method).toEqual("GET");
    // Check query params conditions
    expect(req.request.params.get("courseId")).toEqual("12");
    expect(req.request.params.get("filter")).toEqual("");
    expect(req.request.params.get("sortOrder")).toEqual("asc");
    expect(req.request.params.get("pageNumber")).toEqual("0");
    expect(req.request.params.get("pageSize")).toEqual("3");

    // trigger request
    req.flush({
      payload: findLessonsForCourse(12).slice(0, 3),
    });
  });

  afterEach(() => {
    // Do not perform unintended requests
    httpTestingController.verify();
  });
});
